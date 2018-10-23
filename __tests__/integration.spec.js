const path = require('path')
const fs = require('fs-extra')
const { execa } = require('@vue/cli-shared-utils')
const dummyRoot = path.resolve(__dirname, '../dummy')

test('runs command', async () => {
  if (fs.exists(dummyRoot)) {
    const runner = await execa(
      'yarn',
      ['test:e2e', '--spec', 'spec/dummy.spec.js', '--mode', 'development', '--headless'],
      { cwd: dummyRoot }
    )

    expect(runner.code).toEqual(0)
    expect(runner.stdout).toMatch(/development build/m)
  } else {
    throw Error('Dummy project does not exist. Run `yarn test:dummy` to setup the dummy project')
  }
})
