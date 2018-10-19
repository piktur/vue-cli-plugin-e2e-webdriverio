const {
  PLUGIN_NAME,
  WDIO_CONFIG_DEFAULT_PATH,
  WDIO_CONFIG_OVERRIDE_PATH,
  ON,
  OFF,
} = require('./lib/constants')

module.exports.defaultModes = {
  // @note Command `vue-cli-service serve` is issued if option `baseUrl` undefined. The command
  // starts the "development" server in the mode specified here. Default Vue CLI configuration
  // enables Webpack HMR in `development` mode only. If mode set to anything other than `production`
  // or `development` the app will not render as it is unable to connect to the HMR socket.
  //
  // @see https://cli.vuejs.org/guide/mode-and-env.html#modes
  'test:e2e': 'production',
}

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
    const { execa } = require('@vue/cli-shared-utils')
    const pluginOptions = options.pluginOptions[PLUGIN_NAME] || {}

    process.env.VUE_CONTEXT = api.resolve('./')

    let server
    try {
      server = await WDIOServer(rawArgs, api, pluginOptions)
      await WDIOPort(rawArgs)
    } catch (err) {
      console.error(err)
    }

    try {
      WDIOConfig(rawArgs, api, pluginOptions)
      const runner = await execa(WDIOBinPath(api), rawArgs, { stdio: 'inherit' })

    if (server) {
      runner.on('exit', () => server.close())
      runner.on('error', () => server.close())
    }

    if (process.env.VUE_CLI_TEST) {
      runner.on('exit', code => process.exit(code))
    }

      return runner
    } catch (err) {
    // WDIO launcher returns exit code 1 on failure consequently execa throws,
    // catch to suppress unnecessary stdout pollution.
      console.log(err.message)
    }
  })
}

function WDIOBinPath(api) {
  try {
    return api.resolve('./node_modules/webdriverio/bin/wdio')
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return api.resolve('./node_modules/.bin/wdio')
    } else {
      throw err
}
  }
}

async function WDIOServer(rawArgs, api, { baseUrl }) {
  const baseUrlPos = rawArgs.indexOf('--baseUrl')
  let serverPromise

  if (baseUrlPos === -1) {
    serverPromise = baseUrl ? Promise.resolve({ url: baseUrl }) : api.service.run('serve')
  } else {
    serverPromise = Promise.resolve({ url: rawArgs.splice(baseUrlPos, 2)[1] })
  }

  try {
    const { server, url } = await serverPromise
    rawArgs.push('--baseUrl', url)

    return server
  } catch (err) {
    throw err
  }
}

async function WDIOPort(rawArgs) {
  const getPort = require('get-port')

  if (rawArgs.indexOf('--port') === -1) {
    try {
      const port = await getPort() // find available port

      process.env.VUE_CLI_WDIO_PORT = port
      rawArgs.push('--port', port)
    } catch (err) {
      throw err
    }
  }
}

function WDIOMode(rawArgs, { headless, debug }) {
  const headlessPos = rawArgs.indexOf('--headless')
  const debugPos = rawArgs.indexOf('--debug')

  if (headlessPos === -1) {
    !headless &&
      (process.env.VUE_CLI_WDIO_INTERACTIVE = ON) &&
      (process.env.VUE_CLI_WDIO_HEADLESS = OFF)
  } else {
    process.env.VUE_CLI_WDIO_HEADLESS = ON
    process.env.VUE_CLI_WDIO_INTERACTIVE = OFF
    rawArgs.splice(headlessPos, 1)
  }

  if (debugPos === -1) {
    debug && (process.env.VUE_CLI_WDIO_DEBUG = ON)
  } else {
    process.env.VUE_CLI_WDIO_DEBUG = ON
    rawArgs.splice(debugPos, 1)
}
}

function WDIOCapabilities(rawArgs, { capabilities }) {
  const capabilitiesPos = rawArgs.indexOf('--capabilities')

  if (capabilitiesPos === -1) {
    capabilities && (process.env.VUE_CLI_WDIO_CAPABILITIES = capabilities)
  } else {
    process.env.VUE_CLI_WDIO_CAPABILITIES = rawArgs.splice(capabilitiesPos, 2)[1]
  }
}

function WDIOSpecs(rawArgs, { specs }) {
  const specsPos = rawArgs.indexOf('--specs')

  if (specsPos === -1) {
    specs && (process.env.VUE_CLI_WDIO_SPECS = specs)
  } else {
    process.env.VUE_CLI_WDIO_SPECS = rawArgs.splice(specsPos, 2)[1]
  }
}

function WDIOConfig(rawArgs, api, options) {
  const fs = require('fs')
  const configPos = rawArgs.indexOf('--config')
  let configPath, overridePath

  if (configPos === -1) {
    options.config && (configPath = options.config)
  } else {
    configPath = rawArgs.splice(configPos, 2)[1]
  }

  if (configPath && !fs.existsSync(configPath)) {
    const error = new Error()
    error.code = 'ENOENT'
    error.message = `The nominated config path: ${configPath} does not exist.\n` +
    `Run \`${WDIOBinPath(api)}\` to generate the file or,\n` +
    `run command \`${en.usage}\` without option \`--config\` to use plugin defaults.`

    throw error
  }

  if (fs.existsSync(overridePath = api.resolve(WDIO_CONFIG_OVERRIDE_PATH))) {
    // expose user overrides to config file
    process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH = overridePath
  }

  WDIOMode(rawArgs, options)
  WDIOSpecs(rawArgs, options)
  WDIOCapabilities(rawArgs, options)

  // Append config path to args
  process.env.VUE_CLI_WDIO_DEFAULT = configPath ? OFF : ON
  rawArgs.push(configPath || WDIO_CONFIG_DEFAULT_PATH)
}

function removeArg (rawArgs, arg, offset = 1) {
  const matchRE = new RegExp(`^--${arg}`)
  const equalRE = new RegExp(`^--${arg}=`)
  const i = rawArgs.findIndex(arg => matchRE.test(arg))

  if (i > -1) {
    rawArgs.splice(i, offset + (equalRE.test(rawArgs[i]) ? 0 : 1))
  }
}
