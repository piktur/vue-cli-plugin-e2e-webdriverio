const assert = require('assert').strict
const create = require('@vue/cli-test-utils/createTestProject')
const { execa } = require('@vue/cli-shared-utils')
const fs = require('fs-extra')
const path = require('path')

const pluginName = 'vue-cli-plugin-e2e-webdriverio'
const pluginRoot = path.resolve(process.env.PWD)
const mocksRoot = path.join(pluginRoot, '__mocks__')
const testsRoot = path.join(pluginRoot, '__tests__')
const projectName = 'dummy'
const projectRoot = path.join(mocksRoot, projectName)

function run(command, options = { cwd: projectRoot }) {
  [command, ...args] = command.split(/\s+/)
  if (command === 'vue-cli-service') {
    // appveyor has problem with paths sometimes
    command = require.resolve('@vue/cli-service/bin/vue-cli-service')
  }
  return execa(command, args, options)
}

const write = (file, content) => {
  const targetPath = path.resolve(projectRoot, file)
  const dir = path.dirname(targetPath)
  return fs.ensureDir(dir).then(() => fs.writeFile(targetPath, content))
}

const rm = file => {
  return fs.remove(path.resolve(projectRoot, file))
}

const result = (async function() {
  try {
    // Create dummy project if it doesn't exist
    if (!fs.existsSync(projectRoot)) {
      await fs.ensureDir(mocksRoot)

      const project = await create(projectName, {
        plugins: {
          [pluginName]: {
            version: `file:${pluginRoot}`
          }
        }
      }, mocksRoot)

      await run('yarn link', { cwd: pluginRoot })
      await run(`yarn link ${pluginName}`)
      await run('yarn install')
      await run(`vue invoke ${pluginName}`)

      await write('wdio.conf.js', `
  module.exports = {
    override: true,
    specs: ['spec/**/*.js'],
  }`
      )

      await write('spec/dummy.spec.js', `
  const { assert } = require('chai')

  describe('an assertion', function() {
    before(() => browser.url('/'))

    it('runs', () => {
      const app = browser.$('#app')
      app.waitForVisible(1000)

      assert.ok(app.isVisible())
    })
  })`
      )
    }

    const result = await run('vue-cli-service test:e2e --spec spec/dummy.spec.js')
    console.log(result)
  } catch (err) {
    console.error(err)
  }
})()
