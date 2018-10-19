const uuid = require('uuid')
const os = require('os')
const path = require('path')
const { chalk } = require('@vue/cli-shared-utils')

const isDebug = process.env.VUE_CLI_WDIO_DEBUG === '1'
const isInteractive = process.env.VUE_CLI_WDIO_INTERACTIVE === '1'
const isHeadless = !isInteractive

function isChrome() {
  const { browser, browserName } = browser.desiredCapabilities
  const matcher = /chrome/i

  return matcher.test(browser) || matcher.test(browserName)
}

function resizeViewport() {
  const { viewportSize } = browser.desiredCapabilities
  const { width, height } = viewportSize

  browser.windowHandleSize({ // setViewportSize seems to be incompatible with Chrome
    width,
    height: isChrome() ? height + 200 : height, // account for Chrome's toolbar size
  })
}

function screenshotPath() {
  const { screenshotPath } = browser.options

  return path.resolve(screenshotPath || os.tmpdir(), `${uuid.v4()}.png`)
}

function saveScreenshot(test) {
  const screenshotPath = screenshotPath()
  const report = [`✖ ${test.parent} ${test.title}\n`, ` Screenshot: ${screenshotPath}\n`]

  try {
    browser.saveScreenshot(screenshotPath)

    if (test.err) report.splice(1, 0, ` Error: ${chalk.bold(test.err.message)}\n`)

    console.log(chalk.red(...report))
  } catch (err) {
    console.error(err.message)
  }
}

function printBrowserConsole() {
  const log = browser.log('browser')

  if (log.value && log.value.length) {
    log.value.forEach((e) => console.log(`[${e.level}] ${e.message}`))
  }
}

module.exports = {
  isDebug,
  isInteractive,
  isHeadless,
  resizeViewport,
  saveScreenshot,
  printBrowserConsole,
}
