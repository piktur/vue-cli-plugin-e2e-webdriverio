const base = require('./wdio.conf.debug').config
const { chromeDriverArgs } = require('./lib/capabilities/Chrome')

exports.config = {
  ...base,
  chromeDriverArgs,
  protocol: 'http',
  services: ['chromedriver'],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    bail: true, // abort suite if any test fails
  },
}
