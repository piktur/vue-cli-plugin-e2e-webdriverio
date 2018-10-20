#!/usr/bin/env node

const create = require('@vue/cli-test-utils/createTestProject')
const fs = require('fs-extra')
const path = require('path')
const { execa } = require('@vue/cli-shared-utils')

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
        [pluginName]: {
          version: `file:${pluginRoot}`,
          ...pluginOptions,
        },
      },
    }, path.dirname(projectRoot))

    await project.write('wdio.conf.js',
`module.exports = {
  override: true,
  specs: ['spec/**/*.js'],
}`)

    await project.write('spec/dummy.spec.js',
`const { assert } = require('chai')

describe('an assertion', function() {
  it('runs', () => {
    browser.url('/')
    const app = browser.$('#app')
    app.waitForVisible(1000)

    assert.ok(app.isVisible())
  })
})`)

    let options = {} // { stdout: 'inherit' }
    let yarnBinPath, vueBinPath, vueCLIServiceBinPath

    try {
      const result = await execa('/usr/bin/which', ['yarn'], options)
      yarnBinPath = result.stdout
    } catch (err) {
      console.error(err.message)
    }

    try {
      const result = await execa('/usr/bin/which', ['vue'], options)
      vueBinPath = result.stdout
    } catch (err) {
      console.error(err.message)
    }

    try {
      const result = await execa('/usr/bin/which', ['vue-cli-service'], options)
      vueCLIServiceBinPath = result.stdout
    } catch (err) {
      console.error(err.message)
    }

    options = { stdio: 'inherit', cwd: projectRoot }
    await execa(yarnBinPath, ['link'], { stdio: 'inherit', cwd: pluginRoot })
    await execa(yarnBinPath, ['install'], options)
    await execa(vueBinPath, ['invoke', pluginName], options)
    await execa(yarnBinPath, ['link', pluginName], options)

    // await execa(vueCLIServiceBinPath, ['test:e2e', '--spec', 'spec/dummy.spec.js'], options)
  } catch (err) {
    console.error(err)
  }
})()
