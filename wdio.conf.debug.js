const base = require('./wdio.conf.base').config
const { resizeViewport, saveScreenshot, printBrowserConsole } = require('./lib/util')
const { isInteractive, isDebug } = require('./lib/util')

const config = module.exports.config = {
  ...base,
}

if (isDebug) {
  // Ensure remote debugger port cleared on SIGINT
  // @see https://github.com/nodejs/node/blob/master/test/sequential/test-inspector-enabled.js
  process.on('SIGINT', process._debugEnd)

  Object.assign(config, {
    debug: true,
    execArgv: ['--inspect'],
  })
}

const configPos = process.argv.indexOf('--config')
if (configPos === -1) {
  let WDIOConfigOverride
  if (WDIOConfigOverride = process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH) {
    const merge = require('lodash.merge')
    WDIOConfigOverride = require(WDIOConfigOverride)
    merge(config, WDIOConfigOverride.config)
  }

  function beforeSuite(suite) {
    if (isInteractive) resizeViewport()
  }

  function afterTest(test) {
    if (!test.passed) saveScreenshot(test)
  }

  function onError(message) {
    if (isDebug) printBrowserConsole()
  }

  [beforeSuite, afterTest, onError].forEach(fn => {
    const override = config[fn.name]

    if (override) {
      config[fn.name] = (Array.isArray(override) ? override : Array(override)).unshift(fn)
    } else  {
      config[fn.name] = fn
    }
  })
}
