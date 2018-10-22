const base = require('./wdio.conf.debug').config
const { chromeDriverArgs } = require('./lib/capabilities/Chrome')
const { isDefault } = require('./lib/util')

const config = module.exports.config = {
  ...base,
  capabilities: [],
  protocol: 'http',
  chromeDriverArgs: chromeDriverArgs(),
  services: ['chromedriver'],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    bail: true, // abort suite if any test fails
  },
}

if (isDefault()) {
  // User overrides MUST BE applied last
  let configOverride = process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH
  if (configOverride) {
    const merge = require('lodash.merge')
    configOverride = require(configOverride).config

    merge(config, configOverride)
  }

  const { hooks } = require('./wdio.conf.debug')
  const { mergeHooks } = require('./lib/util')

  mergeHooks(config, ...hooks)
}

if (process.env.VUE_CLI_WDIO_CAPABILITIES) {
  config.capabilities = require('./lib/capabilities').get(process.env.VUE_CLI_WDIO_CAPABILITIES)
}
