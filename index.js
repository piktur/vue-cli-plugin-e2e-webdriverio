const {
  PLUGIN_NAME,
  WDIO_CONFIG_DEFAULT_PATH,
  WDIO_CONFIG_OVERRIDE_PATH,
  ON,
  OFF,
} = require('./lib/constants')
const en = require('./locales/en.json').io.piktur[PLUGIN_NAME].tasks.test

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
      '--mode': en.mode,
      '--specs': en.specs,
    },
    details: en.details,
  }, async (args, rawArgs) => {
    const { execa, error } = require('@vue/cli-shared-utils')
    const pluginOptions = options.pluginOptions[PLUGIN_NAME] || {}

    process.env.VUE_CONTEXT = api.resolve('./')

    let server
    try {
      server = await handleBaseUrl(args, rawArgs, api, pluginOptions)
      await handlePort(args, rawArgs)
    } catch (err) {
      console.error(err)
    }

    handleConfig(args, rawArgs, api, pluginOptions)
    const runner = execa(WDIOBinPath(api), rawArgs, { stdio: 'inherit' })

    if (server) {
      runner.on('exit', () => server.close())
      runner.on('error', () => server.close())
    }

    if (process.env.VUE_CLI_TEST) {
      runner.on('exit', code => process.exit(code))
    }

    // @todo WDIO launcher returns exit code 1 on failure consequently execa throws,
    // catch to suppress unnecessary stdout pollution.
    return runner.catch(err => error(err.message))
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

module.exports.WDIOConfigDefault = () => require('./wdio.conf.default.js')
module.exports.capabilities = require('./lib/capabilities')
module.exports.util = require('./lib/util')
const defaultModes = module.exports.defaultModes = {
  // @note Command `vue-cli-service serve` is issued if option `baseUrl` undefined. The command
  // starts the "development" server in the mode specified here. Default Vue CLI configuration
  // enables Webpack HMR in `development` mode only. If mode set to anything other than `production`
  // or `development` the app will not render as it is unable to connect to the HMR socket.
  //
  // @see https://cli.vuejs.org/guide/mode-and-env.html#modes
  'test:e2e': 'production',
}

async function handleBaseUrl(args, rawArgs, api, options) {
  let serverPromise

  removeArg(rawArgs, 'baseUrl')
  removeArg(rawArgs, 'mode')

  if (args.baseUrl) {
    serverPromise = Promise.resolve({ url: args.baseUrl })
  } else {
    const mode = args.mode || options.mode || defaultModes['test:e2e']

    serverPromise = options.baseUrl
      ? Promise.resolve({ url: options.baseUrl })
      : api.service.run('serve', { mode })
  }

  try {
    const { server, url } = await serverPromise
    rawArgs.push('--baseUrl', url)

    return server
  } catch (err) {
    throw err
  }
}

async function handlePort(args, rawArgs) {
  const getPort = require('get-port')

  if (args.port) return

  try {
    const port = await getPort() // find available port

    process.env.VUE_CLI_WDIO_PORT = port
    rawArgs.push('--port', port)
  } catch (err) {
    throw err
  }
}

function handleHeadless(...args) {
  switchMode('headless', ...args, () => {
    process.env.VUE_CLI_WDIO_HEADLESS = ON
    process.env.VUE_CLI_WDIO_INTERACTIVE = OFF
  }, () => {
    process.env.VUE_CLI_WDIO_HEADLESS = OFF
    process.env.VUE_CLI_WDIO_INTERACTIVE = ON
  })
}

function handleDebug(...args) {
  switchMode('debug', ...args,
    () => (process.env.VUE_CLI_WDIO_DEBUG = ON),
    () => (process.env.VUE_CLI_WDIO_DEBUG = OFF)
  )
}

function handleCapabilities(args, rawArgs, { capabilities }) {
  removeArg(rawArgs, 'capabilities')

  if (args.capabilities) {
    process.env.VUE_CLI_WDIO_CAPABILITIES = args.capabilities
  } else {
    capabilities && (process.env.VUE_CLI_WDIO_CAPABILITIES = capabilities)
  }
}

function handleSpecs(args, rawArgs, { specs }) {
  removeArg(rawArgs, 'specs')

  if (args.specs) {
    process.env.VUE_CLI_WDIO_SPECS = args.specs
  } else {
    specs && (process.env.VUE_CLI_WDIO_SPECS = specs)
  }
}

function handleConfig(args, rawArgs, api, options) {
  const fs = require('fs')
  const path = require('path')
  let configPath

  removeArg(rawArgs, 'config')

  if (args.config) {
    configPath = args.config
  } else {
    options.config && (configPath = options.config)
  }

  if (configPath && !path.isAbsolute(configPath)) {
    configPath = api.resolve(configPath)
  }

  if (configPath && !fs.existsSync(configPath)) {
    const error = new Error()
    error.code = 'ENOENT'
    error.message = `The nominated config path: ${configPath} does not exist.\n` +
    `Run \`${WDIOBinPath(api)}\` to generate the file or,\n` +
    `run command \`${en.usage}\` without option \`--config\` to use plugin defaults.`

    throw error
  }

  const overridePath = api.resolve(WDIO_CONFIG_OVERRIDE_PATH)
  if (fs.existsSync(overridePath)) {
    process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH = overridePath
  }

  handleHeadless(args, rawArgs, options)
  handleDebug(args, rawArgs, options)
  handleSpecs(args, rawArgs, options)
  handleCapabilities(args, rawArgs, options)

  // Append config path to args
  process.env.VUE_CLI_WDIO_DEFAULT = configPath ? OFF : ON
  rawArgs.push(configPath || WDIO_CONFIG_DEFAULT_PATH)
}

function switchMode(option, args, rawArgs, options, on, off) {
  removeArg(rawArgs, option, 0)
  removeArg(rawArgs, `no-${option}`, 0)

  switch (args[option]) {
  case true: return on()
  case false: return off()
  case undefined: return options[option] ? on() : off()
  }
}

function removeArg(rawArgs, arg, offset = 1) {
  const matchRE = new RegExp(`^--${arg}`)
  const equalRE = new RegExp(`^--${arg}=`)
  const i = rawArgs.findIndex(arg => matchRE.test(arg))

  if (i > -1) {
    rawArgs.splice(i, offset + (equalRE.test(rawArgs[i]) ? 0 : 1))
  }
}

if (process.env.VUE_CLI_TEST) {
  Object.assign(module.exports, {
    WDIOBinPath,
    handleBaseUrl,
    handlePort,
    handleHeadless,
    handleDebug,
    handleCapabilities,
    handleSpecs,
    handleConfig,
  })
}
