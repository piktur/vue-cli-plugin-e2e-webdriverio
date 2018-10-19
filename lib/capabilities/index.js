const Device = require('./Device')
const { Chrome } = require('./Chrome')
const browsers = require('./browsers')
const platforms = require('./platforms')

function get(list) {
  const arr = [];

  (Array.isArray(list) ? list : String(list).split(',')).forEach(
    capability => (capability.toLowerCase() in module.exports) &&
      arr.push(module.exports[capability]())
  )

  return arr
}

module.exports = { get, Device, Chrome }

module.exports.capabilityNames = [
  'desktop',
  'android',
  'iphone',
  'ipad',
]

// @see https://github.com/ChromeDevTools/EmulatedDeviceLab/blob/master/lib/device-types.js
// @see https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/emulated_devices/module.json
// @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
// @see https://github.com/SeleniumHQ/selenium/blob/master/py/selenium/webdriver/common/desired_capabilities.py
module.exports.desktop = (options) => new Chrome({
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
})

module.exports.android = (options) => new Chrome({
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
})

module.exports.iphone = (options) => new Chrome({
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
})

module.exports.ipad = (options) => new Chrome({
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
})
