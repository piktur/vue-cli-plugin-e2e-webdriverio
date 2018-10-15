const path = require('path')

// @see http://webdriver.io/guide/testrunner/configurationfile.html
exports.config = {
  specs: [path.resolve(process.env.PWD, 'test/specs/*.js')],
  exclude: [],
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  waitforTimeout: 20000,
  waitforInterval: 100,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  deprecationWarnings: false,
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    bail: true, // abort suite if any test fails
  },
  bail: 1, // abort if any suite fails
}
