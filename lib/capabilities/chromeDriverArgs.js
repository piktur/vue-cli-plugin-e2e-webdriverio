const { isHeadless, isDebug } = require('../util')

// @see https://chromium.googlesource.com/chromium/src/+/32352ad08ee673a4d43e8593ce988b224f6482d3/chrome/common/chrome_switches.cc
// @see https://peter.sh/experiments/chromium-command-line-switches
module.exports = function chromeDriverArgs() {
  const chromeDriverArgs = [
    '--url-base=/wd/hub',
    `--port=${process.env.VUE_CLI_WDIO_PORT}`,
    // @see https://github.com/Codeception/CodeceptJS/issues/561
    '--proxy-server=\'direct://\'',
    '--proxy-bypass-list=*',
  ]

  if (isHeadless()) {
    chromeDriverArgs.push('--headless')
    chromeDriverArgs.push('--mute-audio')
  }

  if (isDebug()) {
    chromeDriverArgs.push(`--remote-debugging-port=${process.debugPort}`)
  }

  return chromeDriverArgs
}
