const path = require('path')
const capabilities = require('./lib/capabilities').get(process.env.VUE_CLI_WDIO_CAPABILITIES)
const { isInteractive, resizeViewport } = require('./lib/util')

// @see http://webdriver.io/guide/testrunner/configurationfile.html
const config = {
  specs: [path.resolve(process.env.VUE_CONTEXT, process.env.VUE_CLI_WDIO_SPECS)],
  exclude: [],
  path: '/wd/hub', // must be absolute
  capabilities,
  maxInstances: 1,
  sync: true,
  logLevel: 'verbose',
  coloredLogs: true,
  deprecationWarnings: false,
  waitforTimeout: 20000,
  waitforInterval: 100,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  bail: 1, // abort if any suite fails
}

function beforeSuite(suite) {
  if (isInteractive()) resizeViewport()
}

module.exports = { config, hooks: [beforeSuite] }
