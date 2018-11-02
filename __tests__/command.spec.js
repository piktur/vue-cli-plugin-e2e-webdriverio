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
  const Service = require('@vue/cli-service/lib/Service')

  const mockRun = jest.fn((command, args, rawArgv) => {
    switch (command) {
    case 'serve':
      return Promise.resolve({ server: {}, url: 'webpackDevServer' })
    case 'test:e2e':
      break
    }
  })

  jest.mock('@vue/cli-service/lib/Service', () => {
    return jest.fn().mockImplementation(() => {
      return { run: mockRun }
    })
  })

  const fn = plugin.handleBaseUrl
  const service = new Service('/', {})
  const api = { service }
  let args, rawArgs, options

  beforeEach(async () => await fn(args, rawArgs, api, options))

  describe('with CLI option', () => {
    args = { baseUrl: 'remote' }
    rawArgs = ['--baseUrl', 'remote']
    options = {}

    test('sets baseUrl CLI option', async () => {
      expect(rawArgs).toContain(...rawArgs)
    })
  })

  describe('defined in project options', () => {
    args = {}
    rawArgs = []
    options = { baseUrl: 'remote' }

    test('sets baseUrl CLI option', async () => {
      expect(rawArgs).toContain('--baseUrl', 'remote')
    })
  })

  describe('when undefined', () => {
    args = { mode: 'development' }
    rawArgs = ['--mode', 'development']
    options = {}

    test('starts the dev server and sets baseUrl CLI option accordingly', async () => {
      expect(mockRun).toBeCalledWith('serve', { mode: 'development' })
      expect(rawArgs).toContain('--baseUrl', 'webpackDevServer')
    })
  })
})

describe('handlePort()', () => {
  const fn = plugin.handlePort
  let args, rawArgs

  beforeEach(async () => await fn(args, rawArgs))

  describe('with CLI option', () => {
    args = { port: 1 }
    rawArgs = ['--port', 1]

    test('sets port CLI option', async () => {
      expect(rawArgs).toContain(...rawArgs)
    })
  })

  describe('when undefined', () => {
    args = {}
    rawArgs = []

    test('sets port CLI option', async () => {
      expect(rawArgs).toContain('--port')
    })
  })
})

describe('handleHeadless()', () => {
  const fn = plugin.handleHeadless
  let args, rawArgs, options

  beforeEach(() => {
    delete process.env.VUE_CLI_WDIO_HEADLESS
    delete process.env.VUE_CLI_WDIO_INTERACTIVE

    fn(args, rawArgs, options)
  })

  describe('with CLI option', () => {
    args = { headless: true }
    rawArgs = ['--headless']
    options = {}

    test('enables headless mode', () => {
      expect(rawArgs).not.toContain('--headless')
      expect(isHeadless()).toBeTruthy
      expect(isInteractive()).toBeFalsey
    })
  })

  describe('enabled within project options', () => {
    args = {}
    rawArgs = []
    options = { headless: true }

    test('enables headless mode', () => {
      expect(isHeadless()).toBeTruthy
      expect(isInteractive()).toBeFalsey
    })
  })

  describe('disabled within project options', () => {
    args = {}
    rawArgs = []
    options = { headless: false }

    test('does not set headless CLI option', () => {
      expect(isHeadless()).toBeFalsey
      expect(isInteractive()).toBeTruthy
    })
  })

  describe('precedence', () => {
    describe('enabled in project options', () => {
      args = { headless: false }
      rawArgs = ['--no-headless']
      options = { headless: true }

      test('CLI option wins', () => {
        expect(isHeadless()).toBeFalsey
        expect(isInteractive()).toBeTruthy
      })
    })

    describe('disabled in project options', () => {
      args = { headless: true }
      rawArgs = ['--headless']
      options = { headless: false }

      test('CLI option wins', () => {
        expect(isHeadless()).toBeTruthy
        expect(isInteractive()).toBeFalsey
      })
    })
  })
})

describe('handleDebug()', () => {
  const fn = plugin.handleDebug
  let args, rawArgs, options

  beforeEach(() => {
    delete process.env.VUE_CLI_WDIO_DEBUG

    fn(args, rawArgs, options)
  })

  describe('with CLI option', () => {
    args = { debug: true }
    rawArgs = ['--debug']
    options = {}

    test('enables debug mode', () => {
      expect(rawArgs).not.toContain('--debug')
      expect(isDebug()).toBeTruthy
    })
  })

  describe('enabled within project options', () => {
    args = { debug: true }
    rawArgs = []
    options = { debug: true }

    test('enables debug mode', () => {
      expect(isDebug()).toBeTruthy
    })
  })

  describe('disabled within project options', () => {
    args = {}
    rawArgs = []
    options = { debug: false }

    test('does not set debug CLI option', () => {
      expect(isDebug()).toBeFalsey
    })
  })

  describe('precedence', () => {
    describe('enabled in project options', () => {
      args = { debug: false }
      rawArgs = ['--no-debug']
      options = { debug: true }

      test('CLI option wins', () => {
        expect(isDebug()).toBeFalsy
      })
    })

    describe('disabled in project options', () => {
      args = { debug: true }
      rawArgs = ['--debug']
      options = { debug: false }

      test('CLI option wins', () => {
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

  describe('with CLI option', () => {
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

  describe('defined in project options', () => {
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
    test('exposes list to WDIO config', () => {
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

  describe('with CLI option', () => {
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

  describe('with project option', () => {
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
    test('exposes pattern to WDIO config', () => {
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
    test('should append default WDIO config path to args', () => {
      fn(args, rawArgs, api, options)

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(WDIO_CONFIG_DEFAULT_PATH)
    })
  })

  describe('when extistent path defined in project config', () => {
    const configFile = 'wdio.conf.mine.js'
    const configPath = path.join(projectRoot, configFile)

    beforeAll(() => fs.writeFileSync(configPath, ''))

    test('should append default WDIO config path to args', () => {
      fn({}, [], api, { config: configPath })

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(WDIO_CONFIG_DEFAULT_PATH)
    })
  })

  describe('when existent relative path given to CLI', () => {
    const configFile = 'wdio.conf.mine.js'
    const configPath = path.join(projectRoot, configFile)

    beforeAll(() => {
      process.env.VUE_CONTEXT = projectRoot

      fs.ensureDirSync(path.dirname(configPath))
      fs.existsSync(configPath) || fs.writeFileSync(configPath, '')
    })

    test('should append their WDIO config path to args', () => {
      const args = { config: configFile }
      const rawArgs = ['--config', configFile]

      fn(args, rawArgs, api, options)

      expect(rawArgs).not.toContain('--config')
      expect(rawArgs).toContain(configPath)
    })
  })

  describe('when non existent path given to CLI', () => {
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
