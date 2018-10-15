module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'io.piktur.vue-cli-plugin-e2e-webdriverio.test.description',
    link: 'https://github.com/piktur/vue-cli-plugin-e2e-webdriverio#injected-commands',
    prompts: [
      {
        name: 'baseUrl',
        type: 'input',
        default: 'http://localhost:8080',
        description: 'io.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.baseUrl'
      }, {
        name: 'config',
        type: 'input',
        default: undefined,
        description: 'io.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.config'
      }, {
        name: 'capabilities',
        type: 'checkbox',
        choices: [
          {
            name: 'phablet',
            value: 'phablet',
            checked: true,
          }, {
            name: 'mobile',
            value: 'mobile',
            checked: true,
          },
        ],
        default: 'phablet,mobile',
        description: 'io.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.capabilities'
      }, {
        name: 'headless',
        type: 'confirm',
        default: true,
        description: 'io.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.headless'
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.baseUrl) args.push('--baseUrl', answers.baseUrl)
      if (answers.config) args.push('--config', answers.config)
      if (answers.capabilities) args.push('--capabilities', answers.capabilities)
      if (answers.headless) args.push('--headless')
    },
  })
}
