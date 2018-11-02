const uuid = require('uuid')
const os = require('os')
const path = require('path')
const { chalk } = require('@vue/cli-shared-utils')
const { ON } = require('./constants')

const isDefault = () => process.env.VUE_CLI_WDIO_DEFAULT === ON
const isDebug = () => process.env.VUE_CLI_WDIO_DEBUG === ON
const isInteractive = () => process.env.VUE_CLI_WDIO_INTERACTIVE === ON
const isHeadless = () => process.env.VUE_CLI_WDIO_HEADLESS === ON

function isChrome() {
  const desiredCapabilities = browser.desiredCapabilities
  const matcher = /chrome/i

  return matcher.test(desiredCapabilities.browser) ||
    matcher.test(desiredCapabilities.browserName)
}

function resizeAdjust(dim, windowSize, actual, expected) {
  actual = actual[dim]
  expected = expected[dim]
  windowSize = windowSize[dim]

  if (actual === expected) return actual

  if (actual < expected) {
    return windowSize + (expected - actual)
  } else {
    return windowSize - (actual - expected)
  }
}

// @note Chrome restricts browser width; cannot be less than 400
function resizeViewport() {
  const { viewportSize } = browser.desiredCapabilities

  if (!viewportSize) return

  let { width, height } = viewportSize
  const actualViewportSize = browser.getViewportSize()

  if ((actualViewportSize.width === width) && (actualViewportSize.height === height)) return

  const actualWindowSize = browser.windowHandleSize().value

  height = resizeAdjust('height', actualWindowSize, actualViewportSize, viewportSize)
  width = resizeAdjust('width', actualWindowSize, actualViewportSize, viewportSize)

  browser.windowHandleSize({ width, height })
}

function screenshotPath() {
  const { screenshotPath } = browser.options

  return path.resolve(screenshotPath || os.tmpdir(), `${uuid.v4()}.png`)
}

function saveScreenshot(test) {
  const path = screenshotPath()
  const report = [`✖ ${test.parent} ${test.title}\n`, ` Screenshot: ${path}\n`]

  try {
    browser.saveScreenshot(path)

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

function mergeHooks(config, ...hooks) {
  hooks.forEach(fn => {
    const override = config[fn.name]

    if (override) {
      config[fn.name] = (Array.isArray(override) ? override : Array(override))
      config[fn.name].unshift(fn)
    } else {
      config[fn.name] = [fn]
    }
  })
}

module.exports = {
  isChrome,
  isDefault,
  isDebug,
  isInteractive,
  isHeadless,
  resizeViewport,
  saveScreenshot,
  printBrowserConsole,
  mergeHooks,
}
