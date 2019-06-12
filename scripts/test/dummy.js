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
  baseUrl: undefined,
  capabilities: ['desktop'],
  config: 'wdio.conf.js',
  debug: true,
  headless: true,
  specs: 'specs/**/*',
}

const WDIOCOnfigOverrideTemplate = `module.exports = {
  override: true,
  specs: ['spec/**/*.js'],
}`

const specTemplate = `const { assert } = require('chai')

describe('an assertion', function() {
  it('runs', () => {
    browser.url('/')
    const app = browser.$('#app')
    app.waitForDisplayed(1000)

    assert.ok(app.isDisplayed())
  })
})`

const env = {
  development: 'VUE_APP_TITLE=Dummy (development)',
  production: 'VUE_APP_TITLE=Dummy (production)',
  test: 'VUE_APP_TITLE=Dummy (test)',
};

(async () => {
  try {
    const yarnBinPath = execa.sync('/usr/bin/which', ['yarn']).stdout

    if (!fs.existsSync(projectRoot)) {
      const [, project] = await Promise.all([
        fs.ensureDir(path.dirname(projectRoot)),
        createProject(),
      ])

      let vueBinPath
      try {
        vueBinPath = execa.sync('/usr/bin/which', ['vue']).stdout

        execa.sync(yarnBinPath, ['link'], { stdio: 'inherit', cwd: pluginRoot })

        process.chdir(projectRoot)
        execa.sync(yarnBinPath, ['install'], { stdio: 'inherit' })
        execa.sync(vueBinPath, ['invoke', pluginName], { stdio: 'inherit' })
        execa.sync(yarnBinPath, ['link', pluginName], { stdio: 'inherit' })
      } catch (err) {
        console.error(err.message)
        process.exit(1)
      }

      await Promise.all([
        project.write('wdio.conf.js', WDIOCOnfigOverrideTemplate),
        project.write('spec/dummy.spec.js', specTemplate),
        ...Object.keys(env).map((key) => project.write(`.env.${key}`, env[key])),
      ])
    } else {
      process.chdir(projectRoot)
    }

    execa.sync(yarnBinPath, ['test:e2e', '--spec', 'spec/dummy.spec.js', '--headless'], { stdio: 'inherit' })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

async function createProject() {
  const project = await create(projectName, {
    plugins: {
      [pluginName]: {
        version: `file:${pluginRoot}`,
        ...pluginOptions,
      },
    },
  }, path.dirname(projectRoot), false /* no Git */)

  return project
}
