const Device = require('./Device')
const chromeDriverArgs = require('./chromeDriverArgs')
const { PLUGIN_NAME } = require('../constants')

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
module.exports = class Chrome extends Device {
  constructor(opts = {}) {
    const args = [
      ...chromeDriverArgs(),
      // @see https://bugs.chromium.org/p/chromium/issues/detail?id=820453#c6 tenuous status
      '--disable-infobars',
    ]

    if (opts.viewportSize) {
      const { width, height } = opts.viewportSize

      if (width && height) {
        args.push(
          `--window-size=${width},${height}`,
          // `--cast-initial-screen-width=${width}`,
          // `--cast-initial-screen-height=${height}`,
        )

        // hide non-standard options behind a vendor prefix (otherwise
        // chromedriver 75+ throws)
        // see https://www.w3.org/TR/webdriver/#capabilities

        opts[`${PLUGIN_NAME}:viewportSize`] = opts.viewportSize
      }

      delete opts.viewportSize
    }

    if (opts.userAgent) {
      args.push(`--user-agent=${opts.userAgent}`)
      opts[`${PLUGIN_NAME}:userAgent`] = opts.userAgent
      delete opts.userAgent
    }

    const chromeOptions = opts.chromeOptions || opts['goog:chromeOptions'] || {}

    if (chromeOptions.args) {
      args.push(...opts.chromeOptions.args)
    }

    delete opts.chromeOptions // requires vendor prefix

    opts['goog:chromeOptions'] = {
      ...chromeOptions,
      args,
    }

    super(opts)
  }
}
