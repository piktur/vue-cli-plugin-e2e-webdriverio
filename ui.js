module.exports = api => {
  api.describeTask({
    match: /vue-cli-service test:e2e/,
    description: 'com.github.piktur.vue-cli-plugin-e2e-webdriverio.test.description',
    link: 'https://github.com/piktur/vue-cli-plugin-e2e-webdriverio#injected-commands',
    prompts: [
      {
        name: 'url',
        type: 'input',
        default: '',
        description: 'com.github.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.url'
      }, {
        name: 'config',
        type: 'input',
        default: '',
        description: 'com.github.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.config'
      }, {
        name: 'env',
        type: 'input',
        default: 'chrome',
        description: 'com.github.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.env'
      }, {
        name: 'headless',
        type: 'input',
        default: true,
        decription: 'com.github.piktur.vue-cli-plugin-e2e-webdriverio.tasks.test.env'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.url) args.push('--url', answers.url)
      if (answers.config) args.push('--config', answers.config)
      if (answers.env) args.push('--env', answers.env)
      if (answers.headless) args.push('--headless')
    }
  })
}
