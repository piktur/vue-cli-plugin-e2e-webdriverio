#!/usr/bin/env node

const create = require('@vue/cli-test-utils/createTestProject')
const fs = require('fs-extra')
const path = require('path')
const args = require('minimist')(process.argv.slice(2))

const pluginName = 'vue-cli-plugin-e2e-webdriverio'
const pluginRoot = path.resolve(process.env.PWD)
const projectName = 'dummy'
const projectRoot = path.join(args.path || pluginRoot, projectName)
const pluginOptions = {
  baseUrl: 'http://localhost:8080',
  capabilities: ['desktop'],
  config: 'wdio.conf.js',
  debug: true,
  headless: true,
  specs: 'specs/**/*',
};

(async () => {
  try {
    await fs.ensureDir(path.dirname(projectRoot))

    const project = await create(projectName, {
      plugins: {
        '@vue/cli-plugin-eslint': {
          config: 'airbnb',
        },
        [pluginName]: {
          version: `file:${pluginRoot}`,
          ...pluginOptions,
        },
      },
    }, path.dirname(projectRoot))

    await project.run('yarn link', { stdio: 'inherit', cwd: pluginRoot })
    await project.run('yarn install')
    await project.run(`yarn link ${pluginName}`)
    await project.run(`vue invoke ${pluginName}`)

    await project.write('wdio.conf.js', `
module.exports = {
  override: true,
  specs: ['spec/**/*.js'],
}`
    )

    await project.write('spec/dummy.spec.js', `
const { assert } = require('chai')

describe('an assertion', function() {
  it('runs', () => {
    browser.url('/')
    const app = browser.$('#app')
    app.waitForVisible(1000)

    assert.ok(app.isVisible())
  })
})`
    )

    await project.run('vue-cli-service test:e2e --spec spec/dummy.spec.js')
  } catch (err) {
    console.error(err)
  }
})()
