const base = require('./wdio.conf.base').config
const { isDebug, saveScreenshot, printBrowserConsole } = require('./lib/util')

const config = module.exports.config = {
  ...base,
}

if (isDebug()) {
  // Ensure remote debugger port cleared on SIGINT
  // @see https://github.com/nodejs/node/blob/master/test/sequential/test-inspector-enabled.js
  process.on('SIGINT', process._debugEnd)

  Object.assign(config, {
    debug: true,
    execArgv: ['--inspect'],
  })
}

function afterTest(test) {
  if (isDebug() && !test.passed) saveScreenshot(test)
}

function onError(message) {
  if (isDebug()) printBrowserConsole()
}

module.exports.hooks = [
  ...require('./wdio.conf.base').hooks,
  afterTest,
  onError,
]
