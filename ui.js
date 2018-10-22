const {
  PLUGIN_NAME,
  DEFAULT_BASE_URL,
  DEFAULT_CAPABILITIES,
  DEFAULT_SPECS,
  DEFAULT_MODE,
  MODES,
} = require('./lib/constants')
const capabilityNames = require('./lib/capabilities').names()

module.exports = (api) => {
  const namespace = `io.piktur.${PLUGIN_NAME}.tasks.test`
  let name
  let pluginOptions

  try {
    const vueConfig = api.resolve('vue.config.js')
    pluginOptions = require(vueConfig).pluginOptions[PLUGIN_NAME]
  } catch (err) {
    pluginOptions = {}
  }

  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: `${namespace}.description`,
    link: `https://github.com/piktur/${PLUGIN_NAME}#injected-commands`,
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
      }, {
        name: name = 'mode',
        type: 'list',
        choices: MODES.map(name => ({ name, value: name, checked: false })),
        default: pluginOptions[name] || DEFAULT_MODE,
        description: `${namespace}.${name}`,
      }, {
        name: name = 'wdioCLI',
        type: 'input',
        default: undefined,
        description: `${namespace}.${name}`,
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.config) args.push('--config', answers.config)
      if (answers.specs) args.push('--specs', answers.specs)
      if (answers.baseUrl) args.push('--baseUrl', answers.baseUrl)
      if (answers.capabilities) args.push('--capabilities', answers.capabilities)
      if (answers.mode) args.push('--mode', answers.mode)
      answers.headless ? args.push('--headless') : args.push('--no-headless')
      answers.debug ? args.push('--debug') : args.push('--no-debug')
      if (answers.wdioCLI) args.push(answers.wdioCLI.split(' '))
    },
  })
}
