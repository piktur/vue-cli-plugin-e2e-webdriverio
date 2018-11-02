const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('should add script test:e2e', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'vue-cli-plugin-e2e-webdriverio',
    apply: require('../generator'),
    options: {},
  })

  expect(pkg.scripts).toMatchObject({ 'test:e2e': 'vue-cli-service test:e2e' })
})

test('should store pluginOptions in vue config', async () => {
  const answers = {
    baseUrl: 'http://localhost:8080',
    capabilities: ['desktop'],
    config: 'wdio.conf.js',
    debug: true,
    headless: true,
    specs: 'specs/**/*',
  }

  const { pkg } = await generateWithPlugin({
    id: 'vue-cli-plugin-e2e-webdriverio',
    apply: require('../generator'),
    options: answers,
  })

  // const vueConfig = files['vue.config.js']
  // expect(vueConfig).toMatch(new RegExp('vue-cli-plugin-e2e-webdriverio'))

  expect(pkg.vue.pluginOptions).toMatchObject({
    'vue-cli-plugin-e2e-webdriverio': answers,
  })
})

describe('when config override given', () => {
  test('does not add dependencies', async () => {
    const { pkg } = await generateWithPlugin({
      id: 'vue-cli-plugin-e2e-webdriverio',
      apply: require('../generator'),
      options: {
        config: 'wdio.conf.js',
      },
    })

    expect(pkg.devDependencies).toBeFalsy
  })
})

describe('when no config override given', () => {
  test('should add dependencies', async () => {
    const { pkg } = await generateWithPlugin({
      id: 'vue-cli-plugin-e2e-webdriverio',
      apply: require('../generator'),
      options: {},
    })

    expect(pkg.devDependencies).toHaveProperty('chromedriver')
    expect(pkg.devDependencies).toHaveProperty('wdio-chromedriver-service')
    expect(pkg.devDependencies).toHaveProperty('wdio-mocha-framework')
    expect(pkg.devDependencies).toHaveProperty('wdio-spec-reporter')
  })

  describe('when project uses eslint', () => {
    test('should extend eslint config', async () => {
      const { pkg } = await generateWithPlugin([
        {
          id: 'eslint',
          apply: () => {}, // require('@vue/cli-plugin-unit-mocha/generator')
          options: {},
        }, {
          id: 'vue-cli-plugin-e2e-webdriverio',
          apply: require('../generator'),
          options: {},
        },
      ])

      expect(pkg.eslintConfig.env.mocha).toBeTruthy
      expect(pkg.eslintConfig.globals.browser).toBeTruthy
    })
  })

  describe('when project uses mocha', () => {
    test('should add assertions and mocks libs', async () => {
      const { pkg } = await generateWithPlugin([
        {
          id: 'unit-mocha',
          apply: () => {}, // require('@vue/cli-plugin-unit-mocha/generator')
          options: {},
        }, {
          id: 'vue-cli-plugin-e2e-webdriverio',
          apply: require('../generator'),
          options: {},
        },
      ])

      expect(pkg.devDependencies).toHaveProperty('chai')
    })
  })
})
