const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const pluginRoot = path.resolve(__dirname, '..')
const plugin = require('../index.js')
const { isHeadless, isDebug, isInteractive } = require('../lib/util')
const { WDIO_CONFIG_OVERRIDE_PATH, WDIO_CONFIG_DEFAULT_PATH } = require('../lib/constants')

describe('exports', () => {
  test('exposes default config, capabilities and util', () => {
    const expected = ['WDIOConfigDefault', 'capabilities', 'util']

    expected.forEach(prop => expect(plugin).toHaveProperty(prop))

    expect(plugin.WDIOConfigDefault()).toHaveProperty('config')
  })
})

describe('handleBaseUrl()', () => {
  let api
  const fn = plugin.handleBaseUrl

  const Service = require('@vue/cli-service/lib/Service')
  jest.mock('@vue/cli-service/lib/Service')

  const mockRun = jest.fn(async (command, args, rawArgv) => {
    switch (command) {
    case 'serve':
      return Promise.resolve({ server: {}, url: 'webpackDevServer' })
    case 'test:e2e':
      break
    }
  })

  beforeAll(async () => {
    Service.mockImplementation(() => {
      return { run: mockRun }
    })

    const service = await new Service('/', {})
    api = { service }
  })

  describe('with --baseUrl', () => {
    const args = { baseUrl: 'remote' }
    const rawArgs = ['--baseUrl', 'remote']
    const options = {}

    test('sets baseUrl CLI option', async () => {
      await fn(args, rawArgs, api, options)

      expect(rawArgs).toContain(...rawArgs)
    })
  })

  describe('without --baseUrl', () => {
    const mode = 'development'
    const NODE_ENV = process.env.NODE_ENV
    const VUE_CLI_MODE = process.env.VUE_CLI_MODE

    const sharedExamples = (args, rawArgs, options) => {
      test('starts the dev server in mode and adds --baseUrl to argv', async () => {
        await fn(args, rawArgs, api, options)

        expect(mockRun).toBeCalledWith('serve', { mode })
        expect(rawArgs).toContain('--baseUrl', 'webpackDevServer')
      })
    }

    beforeEach(() => {
      delete process.env.NODE_ENV
      delete process.env.VUE_CLI_MODE
    })

    afterEach(() => {
      process.env.VUE_CLI_MODE = VUE_CLI_MODE
      process.env.NODE_ENV = NODE_ENV
    })

    describe('with --mode', () => {
      const args = { mode }
      const rawArgs = ['--mode', mode]
      const options = {}

      beforeEach(() => {
        process.argv.push(...rawArgs)
        plugin.handleMode()
      })

      afterEach(() => process.argv.splice(-2))

      sharedExamples(args, rawArgs, options)
    })

    describe('without --mode and NODE_ENV defined', () => {
      const args = {}
      const rawArgs = []
      const options = {}

      beforeEach(() => {
        process.env.NODE_ENV = mode
        plugin.handleMode()
      })

      sharedExamples(args, rawArgs, options)
    })

    describe('without --mode and VUE_CLI_MODE defined', () => {
      const args = {}
      const rawArgs = []
      const options = {}

      beforeEach(() => {
        process.env.VUE_CLI_MODE = mode
        plugin.handleMode()
      })

      sharedExamples(args, rawArgs, options)
    })

    describe('when mode defined in plugin options', () => {
      const args = {}
      const rawArgs = []
      const options = { mode }

      beforeEach(() => {
        plugin.handleMode()
      })

      sharedExamples(args, rawArgs, options)
    })
  })

  describe('with plugin options', () => {
    const args = {}
    const rawArgs = []
    const options = { baseUrl: 'remote' }

    test('sets baseUrl CLI option', async () => {
      await fn(args, rawArgs, api, options)

      expect(rawArgs).toContain('--baseUrl', 'remote')
    })
  })
})

describe('handlePort()', () => {
  const fn = plugin.handlePort

  describe('with --port', () => {
    const args = { port: 1 }
    const rawArgs = ['--port', 1]

    test('sets port CLI option', async () => {
      await fn(args, rawArgs)

      expect(rawArgs).toContain(...rawArgs)
    })
  })

  describe('without --port', () => {
    const args = {}
    const rawArgs = []

    test('sets port CLI option', async () => {
      await fn(args, rawArgs)

      expect(rawArgs).toContain('--port')
    })
  })
})

describe('handleHeadless()', () => {
  const fn = plugin.handleHeadless

  beforeEach(() => {
    delete process.env.VUE_CLI_WDIO_HEADLESS
    delete process.env.VUE_CLI_WDIO_INTERACTIVE
  })

  describe('with --headless', () => {
    const args = { headless: true }
    const rawArgs = ['--headless']
    const options = {}

    test('enables headless mode', () => {
      fn(args, rawArgs, options)

      expect(rawArgs).not.toContain('--headless')
      expect(isHeadless()).toBeTruthy
      expect(isInteractive()).toBeFalsey
    })
  })

  describe('with --no-headless', () => {
    const args = { headless: false }
    const rawArgs = ['--no-headless']
    const options = {}

    test('enables headless mode', () => {
      fn(args, rawArgs, options)

      expect(rawArgs).not.toContain('--no-headless')
      expect(isHeadless()).toBeFalsey
      expect(isInteractive()).toBeTruthy
    })
  })

  describe('enabled in plugin options', () => {
    const args = {}
    const rawArgs = []
    const options = { headless: true }

    test('enables headless mode', () => {
      fn(args, rawArgs, options)

      expect(isHeadless()).toBeTruthy
      expect(isInteractive()).toBeFalsey
    })
  })

  describe('disabled in plugin options', () => {
    const args = {}
    const rawArgs = []
    const options = { headless: false }

    test('does not set headless CLI option', () => {
      fn(args, rawArgs, options)

      expect(isHeadless()).toBeFalsey
      expect(isInteractive()).toBeTruthy
    })
  })

  describe('precedence', () => {
    describe('enabled in plugin options', () => {
      const args = { headless: false }
      const rawArgs = ['--no-headless']
      const options = { headless: true }

      test('CLI option wins', () => {
        fn(args, rawArgs, options)

        expect(isHeadless()).toBeFalsey
        expect(isInteractive()).toBeTruthy
      })
    })

    describe('disabled in plugin options', () => {
      const args = { headless: true }
      const rawArgs = ['--headless']
      const options = { headless: false }

      test('CLI option wins', () => {
        fn(args, rawArgs, options)

        expect(isHeadless()).toBeTruthy
        expect(isInteractive()).toBeFalsey
      })
    })
  })
})

describe('handleDebug()', () => {
  const fn = plugin.handleDebug

  beforeEach(() => {
    delete process.env.VUE_CLI_WDIO_DEBUG
  })

  describe('with --debug', () => {
    const args = { debug: true }
    const rawArgs = ['--debug']
    const options = {}

    test('enables debug mode', () => {
      fn(args, rawArgs, options)

      expect(rawArgs).not.toContain('--debug')
      expect(isDebug()).toBeTruthy
    })
  })

  describe('with --no-debug', () => {
    const args = { debug: false }
    const rawArgs = ['--no-debug']
    const options = {}

    test('enables debug mode', () => {
      fn(args, rawArgs, options)

      expect(rawArgs).not.toContain('--no-debug')
      expect(isDebug()).toBeFalsey
    })
  })

  describe('enabled in plugin options', () => {
    const args = { debug: true }
    const rawArgs = []
    const options = { debug: true }

    test('enables debug mode', () => {
      fn(args, rawArgs, options)

      expect(isDebug()).toBeTruthy
    })
  })

  describe('disabled in plugin options', () => {
    const args = {}
    const rawArgs = []
    const options = { debug: false }

    test('does not set debug CLI option', () => {
      fn(args, rawArgs, options)

      expect(isDebug()).toBeFalsey
    })
  })

  describe('precedence', () => {
    describe('enabled in plugin options', () => {
      const args = { debug: false }
      const rawArgs = ['--no-debug']
      const options = { debug: true }

      test('CLI option wins', () => {
        fn(args, rawArgs, options)

        expect(isDebug()).toBeFalsy
      })
    })

    describe('disabled in plugin options', () => {
      const args = { debug: true }
      const rawArgs = ['--debug']
      const options = { debug: false }

      test('CLI option wins', () => {
        fn(args, rawArgs, options)

        expect(isDebug()).toBeTruthy
      })
    })
  })
})

describe('handleCapabilities()', () => {
  const fn = plugin.handleCapabilities

  beforeEach(() => {
    jest.resetModules()
    delete process.env.VUE_CLI_WDIO_CAPABILITIES
  })

  describe('with --capabilities', () => {
    test('exposes list to WDIO config', () => {
      const args = { capabilities: 'desktop,iphone' }
      const rawArgs = ['--capabilities', 'desktop,iphone']
      const options = {}

      fn(args, rawArgs, options)

      const { capabilities } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(rawArgs).not.toContain('--capabilities')
      expect(capabilities).toHaveLength(2)
    })
  })

  describe('with plugin options', () => {
    test('exposes list to WDIO config', () => {
      const args = {}
      const rawArgs = []
      const options = { capabilities: 'desktop' }

      fn(args, rawArgs, options)

      const { capabilities } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(capabilities[0].deviceType).toEqual('desktop')
    })
  })

  describe('none', () => {
    test('WDIO config.capabilities should be empty', () => {
      const args = {}
      const rawArgs = []
      const options = {}

      fn(args, rawArgs, options)

      const { capabilities } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(capabilities).toHaveLength(0)
    })
  })
})

describe('handleSpecs()', () => {
  const fn = plugin.handleSpecs

  beforeAll(() => (process.env.VUE_CONTEXT = './'))
  beforeEach(() => {
    jest.resetModules()
    delete process.env.VUE_CLI_WDIO_SPECS
  })

  describe('with --specs', () => {
    test('exposes pattern to WDIO config', () => {
      const args = { specs: 'specs/to/**/run' }
      const rawArgs = ['--specs', 'specs/to/**/run']
      const options = {}

      fn(args, rawArgs, options)

      const { specs } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(rawArgs).not.toContain('--specs')
      expect(specs[0]).toMatch('/specs/to/**/run')
    })
  })

  describe('with plugin options', () => {
    test('exposes pattern to WDIO config', () => {
      const args = {}
      const rawArgs = []
      const options = { specs: 'specs/to/**/run' }

      fn(args, rawArgs, options)

      const { specs } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(specs[0]).toMatch('/specs/to/**/run')
    })
  })

  describe('none', () => {
    test('WDIO config.specs should be empty', () => {
      const args = {}
      const rawArgs = []
      const options = {}

      fn(args, rawArgs, options)

      const { specs } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(specs).toHaveLength(0)
    })
  })
})

describe('handleConfig()', () => {
  const fn = plugin.handleConfig
  const projectRoot = os.tmpdir()
  const WDIOBinPath = path.join(projectRoot, 'node_modules/.bin/wdio')
  const api = { resolve: (input) => path.join(projectRoot, input) }
  const args = {}
  const rawArgs = []
  const options = {}

  beforeAll(() => {
    jest.resetModules()
    fs.ensureDirSync(path.dirname(WDIOBinPath))
    fs.existsSync(WDIOBinPath) || fs.writeFileSync(WDIOBinPath, '')

    delete process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH
    delete process.env.VUE_CLI_WDIO_DEFAULT
  })

  describe('default', () => {
    test('appends default WDIO config path to argv', () => {
      fn(args, rawArgs, api, options)

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(WDIO_CONFIG_DEFAULT_PATH)
    })
  })

  describe('extistent path defined in plugin options', () => {
    const configFile = 'wdio.conf.mine.js'
    const configPath = path.join(projectRoot, configFile)

    beforeAll(() => fs.writeFileSync(configPath, ''))

    test('appends default WDIO config path to argv', () => {
      fn({}, [], api, { config: configPath })

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(WDIO_CONFIG_DEFAULT_PATH)
    })
  })

  describe('provides existent relative path with --config', () => {
    const configFile = 'wdio.conf.mine.js'
    const configPath = path.join(projectRoot, configFile)

    beforeAll(() => {
      process.env.VUE_CONTEXT = projectRoot

      fs.ensureDirSync(path.dirname(configPath))
      fs.existsSync(configPath) || fs.writeFileSync(configPath, '')
    })

    test('appends their WDIO config path to argv', () => {
      const args = { config: configFile }
      const rawArgs = ['--config', configFile]

      fn(args, rawArgs, api, options)

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(configPath)
    })
  })

  describe('provides non existent path with --config', () => {
    test('should throw', () => {
      const mockCall = () => fn({ config: '_.js' }, ['--config', '_.js'], api, options)

      expect(mockCall).toThrow()
    })
  })

  describe('when override path exists', () => {
    const configOverridePath = path.join(projectRoot, WDIO_CONFIG_OVERRIDE_PATH)

    beforeAll(() => {
      fs.ensureDirSync(path.dirname(configOverridePath))
      fs.writeFileSync(configOverridePath,
`const { capabilities } = require('${pluginRoot}').capabilities
capabilities.register('mine', { deviceType: 'theirs' })

module.exports = {
  config: {
    override: true,
    beforeSuite: () => {},
  },
}`
      )
    })

    beforeEach(() => {
      process.env.VUE_CONTEXT = projectRoot
      delete process.env.VUE_CLI_WDIO_CAPABILITIES
      delete process.env.VUE_CLI_WDIO_CONFIG_OVERRIDE_PATH

      jest.resetModules()
    })

    afterAll(async () => await fs.remove(configOverridePath))

    test('merges user overrides', () => {
      fn(args, rawArgs, api, options)

      const { override } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(override).toBeTruthy
    })

    test('appends user defined hooks', () => {
      fn(args, rawArgs, api, options)

      const { beforeSuite } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(beforeSuite).toHaveLength(2)
    })

    test('uses newly registered capabilites', () => {
      const args = { capabilities: 'mine' }
      const rawArgs = ['--capabilities', 'mine']

      fn(args, rawArgs, api, options)

      const { capabilities } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(capabilities).toMatchObject([{ deviceType: 'theirs' }])
    })

    test('uses override capabilities', () => {
      const args = {}
      const rawArgs = []
      const configOverride = require(configOverridePath).config
      configOverride.capabilities = [{ noTouching: '' }]

      fn(args, rawArgs, api, options)

      const { capabilities } = require(WDIO_CONFIG_DEFAULT_PATH).config

      expect(capabilities).toMatchObject(configOverride.capabilities)
    })
  })
})
