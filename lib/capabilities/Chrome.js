const Device = require('./Device')
const { isHeadless, isDebug } = require('../util')

// @see https://peter.sh/experiments/chromium-command-line-switches
const chromeDriverArgs = module.exports.chromeDriverArgs = () => {
  const chromeDriverArgs = [
    '--url-base=/wd/hub',
    `--port=${process.env.VUE_CLI_WDIO_PORT}`,
    // @see https://github.com/Codeception/CodeceptJS/issues/561
    '--proxy-server=\'direct://\'',
    '--proxy-bypass-list=*',
  ]

  if (isHeadless()) {
    chromeDriverArgs.push('--headless')
  } else if (isDebug()) {
    chromeDriverArgs.push(`--remote-debugging-port=${process.debugPort}`)
  }

  return chromeDriverArgs
}

// @see http://chromedriver.chromium.org/mobile-emulation Differences between mobile emulation and real devices
//
// @example ChromeDriver mobileEmulation options
//   new Chrome({
//     chromeOptions: {
//       mobileEmulation: {
//         deviceName: 'iPhone 6/7/8',
//         deviceMetrics: {
//           width: 375,
//           height: 667,
//           pixelRatio: 2,
//         },
//         userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
//       },
//     },
//     // ...
//   })
module.exports.Chrome = class Chrome extends Device {
  constructor(opts) {
    super({ chromeOptions: {}, ...opts })

    if (!this.chromeOptions.args) {
      this.chromeOptions.args = this.defaultChromeDriverArgs
    } else {
      this.chromeOptions.args = [
        ...new Set(this.defaultChromeDriverArgs.concat(this.chromeOptions.args)),
      ]
    }
  }

  get defaultChromeDriverArgs() {
    const args = [
      ...chromeDriverArgs(),
      // @see https://bugs.chromium.org/p/chromium/issues/detail?id=820453#c6 tenuous status
      '--disable-infobars',
    ]

    if (this.userAgent) {
      args.push(`--user-agent=${this.userAgent}`)
    }

    if (this.viewportSize) {
      const { width, height } = this.viewportSize
      width && height && args.push(`--window-size=${width},${height}`)
    }

    return args
  }
}
