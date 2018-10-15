const base = require('./wdio.conf.base')
const uuid = require('uuid')
const os = require('os')
const path = require('path')
const merge = require('lodash.merge')
const { chalk } = require('@vue/cli-shared-utils')
const { chromeDriverArgs, capabilities } = require('./lib/capabilities')

const debug = !!process.env.DEBUG

exports.config = {
  ...base.config,
  capabilities,
  chromeDriverArgs,
  path: '/wd/hub', // must be absolute
  services: ['chromedriver'],
  maxInstances: 1,
}

if (debug) {
  // Ensure remote debugger port cleared if SIGINT received
  // @see https://github.com/nodejs/node/blob/master/test/sequential/test-inspector-enabled.js
  process.on('SIGINT', process._debugEnd)

  Object.assign(exports.config, {
    debug,
    execArgv: ['--inspect'],
  })
}

if (process.env.WDIO_CONFIG_OVERRIDE_PATH) {
  const wdioConfigOverride = require(process.env.WDIO_CONFIG_OVERRIDE_PATH)
  merge(exports.config, wdioConfigOverride.config)
}

function resizeViewport() {
  const { width, height } = browser.desiredCapabilities.viewportSize

  // setViewportSize does not seem to play nice with Chrome
  browser.windowHandleSize({
    width,
    height: height + 200, // account for chrome's toolbar size
  })
}

function beforeSuite(suite) {
  if (debug) {
    resizeViewport()
  }
}

function saveSnapshot(test) {
  const screenshotPath = path.resolve(os.tmpdir(), `${uuid.v4()}.png`)
  const report = [`✖ ${test.parent} ${test.title}\n`, ` Screenshot: ${screenshotPath}\n`]

  try {
    browser.saveScreenshot(screenshotPath)

    if (test.err) {
      report.splice(1, 0, ` Error: ${chalk.bold(test.err.message)}\n`)
    }

    console.log(chalk.red(...report))
  } catch (err) {
    console.error(err)
  }
}

function afterTest(test) {
  if (!test.passed) {
    saveSnapshot(test)
  }
}

function printBrowserConsole() {
  const log = browser.log('browser')

  if (log.value && log.value.length) {
    log.value.forEach((e) => console.log(`[${e.level}] ${e.message}`))
  }
}

function onError(message) {
  if (debug) {
    printBrowserConsole()
  }
}

[beforeSuite, afterTest, onError].forEach(fn => {
  const config = exports.config
  const override = config[fn.name]

  if (override) {
    config[fn.name] = (Array.isArray(override) ? override : Array(override)).unshift(fn)
  } else  {
    config[fn.name] = fn
  }
})
