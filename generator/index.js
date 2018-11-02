const { PLUGIN_NAME } = require('../lib/constants')

module.exports = (api, options) => {
  ['config', 'baseUrl', 'specs'].forEach((prop) => nullify(options, prop))

  // Don't laden the host project with erroneous dependencies. If the user prefers their
  // own configuration, they can keep their configuration. In this case we make no assumptions
  // about the testing framework, assertions/mocking libraries and WebdriverIO plugins; the user
  // is responsibile for dependency management. Suggest they use WebdriverIO's configurator for
  // this purpose.
  if (!options.config) {
    api.extendPackage({
      devDependencies: {
        'chromedriver': '^2.42.0',
        'wdio-chromedriver-service': '^0.1.3',
        'wdio-mocha-framework': '^0.6.2',
        'wdio-spec-reporter': '^0.1.5',
      },
    })

    api.hasPlugin('mocha') || api.extendPackage({
      devDependencies: {
        'chai': '^4.1.2',
      },
    })

    api.hasPlugin('eslint') && api.extendPackage({
      eslintConfig: {
        env: {
          mocha: true,
        },
      },
    })
  }

  api.extendPackage({
    scripts: {
      'test:e2e': 'vue-cli-service test:e2e',
    },
    vue: {
      pluginOptions: {
        [PLUGIN_NAME]: options,
      },
    },
  })

  api.hasPlugin('eslint') && api.extendPackage({
    eslintConfig: {
      globals: {
        browser: true,
      },
    },
  })
}

function nullify(input, property) {
  if (input[property] === '') input[property] = null
}
