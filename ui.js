const {
  PLUGIN_NAME,
  DEFAULT_BASE_URL,
  DEFAULT_CAPABILITIES,
  DEFAULT_SPECS,
} = require('./lib/constants')
const { capabilityNames } = require('./lib/capabilities')

module.exports = (api, options) => {
  const pluginOptions = options.pluginOptions[PLUGIN_NAME] || {}
  const namespace = 'io.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test'

  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: `${namespace}.description`,
    link: 'https://github.com/piktur/vue-cli-plugin-e2e-webdriverio#injected-commands',
    prompts: [
      {
        name: name = 'config',
        type: 'input',
        default: pluginOptions[name],
        description: `${namespace}.${name}`,
      }, {
        name: name = 'specs',
        type: 'input',
        default: pluginOptions[name] || DEFAULT_SPECS,
        description: `${namespace}.${name}`,
      }, {
        name: name = 'baseUrl',
        type: 'input',
        default: pluginOptions[name] || DEFAULT_BASE_URL,
        description: `${namespace}.${name}`,
      }, {
        name: name = 'capabilities',
        type: 'checkbox',
        choices: capabilityNames.map(name => ({ name, value: name, checked: false })),
        default: pluginOptions[name] || DEFAULT_CAPABILITIES,
        description: `${namespace}.${name}`,
      }, {
        name: name = 'headless',
        type: 'confirm',
        default: pluginOptions[name] || false,
        description: `${namespace}.${name}`,
      }, {
        name: name = 'debug',
        type: 'confirm',
        default: pluginOptions[name] || false,
        description: `${namespace}.${name}`,
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.specs) args.push('--specs', answers.specs)
      if (answers.baseUrl) args.push('--baseUrl', answers.baseUrl)
      if (answers.config) args.push('--config', answers.config)
      if (answers.capabilities) args.push('--capabilities', answers.capabilities)
      answers.headless ? args.push('--headless') : args.push('--no-headless')
      answers.debug ? args.push('--debug') : args.push('--no-debug')
    },
  })
}
