

module.exports.WDIOConfigDefault = () => require('./wdio.conf.default.js')
module.exports.capabilities = () => require('./lib/capabilities')
module.exports.util = () => require('./lib/util')

const en = require('./locales/en.json').io.piktur['vue-cli-plugin-e2e-webdriverio'].tasks.test

module.exports = (api, options) => {
  api.registerCommand('test:e2e', {
    description: en.description,
    usage: en.usage,
    options: {
      '-b, --baseUrl': en.baseUrl,
      '--capabilities': en.capabilities,
      '--config': en.config,
      '--debug, --no-debug': en.debug,
      '--headless, --no-headless': en.headless,
      '--specs': en.specs,
    },
    details: en.details,
  }, async (args, rawArgs) => {
    const { logger } = require('@vue/cli-shared-utils')
    let server

    try {
      server = await wdioServer(rawArgs, api)
      await wdioPort(rawArgs)
    } catch (err) {
      logger.error(err)
    }

    process.env.VUE_CONTEXT = api.resolve('./')

    wdioCapabilities(rawArgs)
    wdioMode(rawArgs)
    wdioConfig(rawArgs, api.resolve('wdio.conf.js'))

    const { execa } = require('@vue/cli-shared-utils')
    const wdioBinPath = require.resolve('webdriverio/bin/wdio')
    const runner = execa(wdioBinPath, rawArgs, { stdio: 'inherit' })

    if (server) {
      runner.on('exit', () => server.close())
      runner.on('error', () => server.close())
    }

    if (process.env.VUE_CLI_TEST) {
      runner.on('exit', code => process.exit(code))
    }

    // WDIO launcher returns exit code 1 on failure consequently execa throws,
    // catch to suppress unnecessary stdout pollution.
    return runner.catch(err => null)
  })
}

module.exports.defaultModes = {
  // @note If test, specs fail due to broken Webpack HMR server connection
  'test:e2e': 'production'
}

async function wdioServer(rawArgs, api) {
  const baseUrlPos = rawArgs.indexOf('--baseUrl')
  const serverPromise = baseUrlPos === -1
    ? api.service.run('serve')
    : Promise.resolve({ url: rawArgs.splice(baseUrlPos, 2)[1] })

  try {
    const { server, url } = await serverPromise
    rawArgs.push('--baseUrl', url)
    return server
  } catch (err) {
    throw err
  }
}

async function wdioPort(rawArgs) {
  const getPort = require('get-port')

  if (rawArgs.indexOf('--port') === -1) {
    try {
      rawArgs.push('--port', await getPort()) // find available port
    } catch (err) {
      throw err
    }
  }
}

function wdioMode(rawArgs) {
  const headlessPos = rawArgs.indexOf('--headless')
  if (headlessPos === -1) {
    process.env.DEBUG = '1'
  } else {
    rawArgs.splice(headlessPos, 1)
  }
}

function wdioCapabilities(rawArgs) {
  const capabilitiesPos = rawArgs.indexOf('--capabilities')
  if (capabilitiesPos === -1) {
    process.env.WDIO_CAPABILITIES = 'phablet,mobile'
  } else {
    process.env.WDIO_CAPABILITIES = rawArgs.splice(capabilitiesPos, 2)
  }

  if (process.env.MOBILE_ONLY) {
    process.env.WDIO_CAPABILITIES = 'mobile'
  } else if (process.env.PHABLET_ONLY) {
    process.env.WDIO_CAPABILITIES = 'phablet'
  }
}

function wdioConfig(rawArgs, overridePath) {
  const fs = require('fs')
  const path = require('path')

  const defaultPath = path.resolve(__dirname, './wdio.conf.debug.js')
  let configPath

  const configPos = rawArgs.indexOf('--config')
  if (configPos !== -1) {
    configPath = rawArgs.splice(configPos, 2)[1]
  }

  rawArgs.push(fs.existsSync(configPath) ? configPath : defaultPath)

  if (fs.existsSync(overridePath)) {
    // expose user overrides to config file
    process.env.WDIO_CONFIG_OVERRIDE_PATH = overridePath
  }
}

function removeArg (rawArgs, arg, offset = 1) {
  const matchRE = new RegExp(`^--${arg}`)
  const equalRE = new RegExp(`^--${arg}=`)
  const i = rawArgs.findIndex(arg => matchRE.test(arg))

  if (i > -1) {
    rawArgs.splice(i, offset + (equalRE.test(rawArgs[i]) ? 0 : 1))
  }
}
