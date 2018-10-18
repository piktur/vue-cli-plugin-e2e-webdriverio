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

const names = module.exports.capabilityNames = [
  'chrome',
  'android',
  'iphone',
  'ipad',
]

// @see https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
module.exports.chrome = (options) => new Chrome({
  deviceType: 'desktop',
  deviceName: 'Chrome',
  browserName: browsers.CHROME,
  browserVersion: 'latest',
  // platformName: platforms.MAC,
  // platform: undefined,
  // userAgent: undefined,
  viewportSize: {
    width: 1024,
    height: 768,
  },
  ...options,
})

module.exports.android = (options) => new Device({
  deviceType: 'mobile',
  deviceName: 'Android',
  browserName: browsers.CHROME, // browsers.ANDROID
  browserVersion: 'latest',
  platformName: 'Android',
  platform: platforms.ANDROID,
  // userAgent: undefined,
  viewportSize: {
    width: 768,
    height: 1024,
  },
  ...options,
})

module.exports.iphone = (options) => new Device({
  deviceType: 'mobile',
  deviceName: 'iPhone',
  browserName: browsers.CHROME, // browsers.IPHONE
  browserVersion: 'latest',
  platformName: 'iOS',
  platform: platforms.MAC,
  // userAgent: undefined,
  viewportSize: {
    width: 375,
    height: 667,
  },
  ...options,
})

module.exports.ipad = (options) => new Device({
  deviceType: 'tablet',
  deviceName: 'iPad',
  browserName: browsers.CHROME, // browsers.IPAD
  browserVersion: 'latest',
  platformName: 'iOS',
  platform: platforms.MAC,
  // userAgent: undefined,
  viewportSize: {
    width: 768,
    height: 1024,
  },
  ...options,
})
