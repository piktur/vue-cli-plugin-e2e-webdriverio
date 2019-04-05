const path = require('path')

// @see http://webdriver.io/guide/testrunner/configurationfile.html
module.exports.config = {
  specs: specs(),
  exclude: [],
  path: '/wd/hub', // must be absolute
  maxInstances: 1,
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  deprecationWarnings: false,
  waitforTimeout: 20000,
  waitforInterval: 100,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  bail: 1, // abort if any suite fails
}

function specs() {
  if (('VUE_CONTEXT', 'VUE_CLI_WDIO_SPECS') in process.env) {
    return [path.resolve(process.env.VUE_CONTEXT, process.env.VUE_CLI_WDIO_SPECS)]
  } else {
    return []
  }
}
