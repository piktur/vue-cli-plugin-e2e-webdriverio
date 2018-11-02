const { PLUGIN_NAME } = require('../lib/constants')

module.exports = (api, options) => {
  ['config', 'baseUrl', 'specs'].forEach((prop) => nullify(options, prop))

  api.hasPlugin('eslint') && api.extendPackage({
    eslintConfig: {
      env: {
        mocha: true,
      },
    },
  })

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
