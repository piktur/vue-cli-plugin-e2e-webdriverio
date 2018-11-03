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

  const mode = options.mode
  const cmd = 'vue-cli-service test:e2e'

  api.extendPackage({
    scripts: {
      'test:e2e': mode ? `NODE_ENV=${mode} VUE_CLI_MODE=${mode} ${cmd}` : cmd,
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
