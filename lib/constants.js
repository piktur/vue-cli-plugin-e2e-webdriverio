const path = require('path')

module.exports = {
  PLUGIN_NAME: 'vue-cli-plugin-e2e-webdriverio',
  WDIO_CONFIG_BASE_PATH: path.resolve(__dirname, '../wdio.conf.base.js'),
  WDIO_CONFIG_DEBUG_PATH: path.resolve(__dirname, '../wdio.conf.debug.js'),
  WDIO_CONFIG_DEFAULT_PATH: path.resolve(__dirname, '../wdio.conf.default.js'),
  WDIO_CONFIG_OVERRIDE_PATH: 'wdio.conf.js',
  DEFAULT_BASE_URL: 'http://localhost:8080',
  DEFAULT_CAPABILITIES: 'chrome',
  DEFAULT_SPECS: 'test/spec/**/*.js',
}
