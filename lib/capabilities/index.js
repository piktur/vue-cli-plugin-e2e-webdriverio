const Device = require('./Device')
const { Chrome } = require('./Chrome')
const browsers = require('./browsers')
const platforms = require('./platforms')

const __util__ = {
  Device,

  Chrome,

  names() {
    const util = Object.keys(__util__)

    return Object.keys(this).filter(e => !util.includes(e))
  },

  registerCapability(name, capability) {
    this[name] = capability
  },

  get(names) {
    const arr = []
    names = Array.isArray(names) ? names : String(names).split(',')

    names.forEach(capability => {
      capability = this[capability.toLowerCase()]
      capability && arr.push(typeof capability === 'function' ? capability() : capability)
    })

    return arr
  },
}

// @see https://github.com/ChromeDevTools/EmulatedDeviceLab/blob/master/lib/device-types.js
// @see https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/emulated_devices/module.json
// @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
// @see https://github.com/SeleniumHQ/selenium/blob/master/py/selenium/webdriver/common/desired_capabilities.py
module.exports = {
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

for (const util in __util__) {
  module.exports[util] = __util__[util].bind(module.exports)
}
