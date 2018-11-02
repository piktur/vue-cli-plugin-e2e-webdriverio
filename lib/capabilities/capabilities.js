// @see https://github.com/ChromeDevTools/EmulatedDeviceLab/blob/master/lib/device-types.js
// @see https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/emulated_devices/module.json
// @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
// @see https://github.com/SeleniumHQ/selenium/blob/master/py/selenium/webdriver/common/desired_capabilities.py

const Chrome = require('./Chrome')
const browsers = require('./browsers')
const platforms = require('./platforms')
const CAPABILITIES = Symbol.for('VUE_CLI_WDIO.CAPABILITIES')

if (!(CAPABILITIES in global)) {
  global[CAPABILITIES] = {
    desktop: (options) => new Chrome({
      deviceType: 'desktop',
      deviceName: 'Desktop',
      browserName: browsers.CHROME,
      browser: browsers.CHROME,
      browserVersion: 'latest',
      version: 'latest',
      platformName: 'MacOS',
      platform: platforms.MAC,
      viewportSize: {
        width: 1024,
        height: 768,
      },
      ...options,
    }),

    android: (options) => new Chrome({
      deviceType: 'mobile',
      deviceName: 'Android',
      browserName: browsers.CHROME,
      browser: browsers.CHROME,
      browserVersion: 'latest',
      version: 'latest',
      platformName: 'Android',
      platform: platforms.ANDROID,
      viewportSize: {
        width: 768,
        height: 1024,
      },
      ...options,
    }),

    iphone: (options) => new Chrome({
      deviceType: 'mobile',
      deviceName: 'iPhone',
      browserName: browsers.CHROME,
      browser: browsers.CHROME,
      browserVersion: 'latest',
      version: 'latest',
      platformName: 'iOS',
      platform: platforms.MAC,
      viewportSize: {
        width: 375,
        height: 667,
      },
      ...options,
    }),

    ipad: (options) => new Chrome({
      deviceType: 'tablet',
      deviceName: 'iPad',
      browserName: browsers.CHROME,
      browser: browsers.CHROME,
      browserVersion: 'latest',
      version: 'latest',
      platformName: 'iOS',
      platform: platforms.MAC,
      viewportSize: {
        width: 768,
        height: 1024,
      },
      ...options,
    }),
  }
}

const container = {}

Object.defineProperties(container, {
  all: {
    get() { return global[CAPABILITIES] },
  },
  names: {
    get() { return Object.keys(global[CAPABILITIES]) },
  },
  register: {
    value(name, capability) { this.all[name] = capability },
  },
  find: {
    value(names) {
      const arr = []
      names = Array.isArray(names) ? names : String(names).split(',')

      names.forEach(name => {
        const obj = this.all[name.toLowerCase()]
        obj && arr.push(typeof obj === 'function' ? obj() : obj)
      })

      return arr
    },
  },
})

Object.freeze(container)

module.exports = container
