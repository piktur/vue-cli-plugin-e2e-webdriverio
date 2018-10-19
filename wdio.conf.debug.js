const { config } = require('./wdio.conf.base')
const { isDebug, saveScreenshot, printBrowserConsole } = require('./lib/util')

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
  if (!test.passed) saveScreenshot(test)
}

function onError(message) {
  if (isDebug()) printBrowserConsole()
}

module.exports = { config, hooks: [...require('./wdio.conf.base').hooks, afterTest, onError] }
