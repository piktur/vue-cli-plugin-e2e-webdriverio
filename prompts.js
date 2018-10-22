/* eslint-disable no-return-assign */

const {
  PLUGIN_NAME,
  DEFAULT_BASE_URL,
  DEFAULT_CAPABILITIES,
  DEFAULT_SPECS,
} = require('./lib/constants')
const en = require('./locales/en.json').io.piktur[PLUGIN_NAME].tasks.test
const capabilityNames = require('./lib/capabilities').names()

module.exports = (pkg) => {
  let name

  return [
    {
      name: name = 'config',
      type: 'input',
      default: undefined,
      message: en[name],
    }, {
      name: name = 'specs',
      type: 'input',
      default: DEFAULT_SPECS,
      message: en[name],
    }, {
      name: name = 'baseUrl',
      type: 'input',
      default: DEFAULT_BASE_URL,
      message: en[name],
    }, {
      name: name = 'capabilities',
      type: 'checkbox',
      choices: capabilityNames.map(name => ({ name, value: name, checked: false })),
      default: DEFAULT_CAPABILITIES,
      message: en[name],
      // when: ({ config }) => config === '',
    }, {
      name: name = 'headless',
      type: 'confirm',
      default: false,
      message: en[name],
      // when: ({ config }) => config === '',
    }, {
      name: name = 'debug',
      type: 'confirm',
      default: false,
      message: en[name],
      // when: ({ config }) => config === '',
    },
  ]
}
