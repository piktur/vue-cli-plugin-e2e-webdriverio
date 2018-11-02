const { capabilities, Chrome, chromeDriverArgs } = require('../lib/capabilities')

describe('all(String | String[])', () => {
  test('should expose predefined capabilities', () => {
    expect(capabilities.all).toBeInstanceOf(Object)
    capabilities.names.forEach((name) => expect(name in capabilities))
  })
})

describe('find(String | String[])', () => {
  test('returns an Array of predefined capabilities', () => {
    expect(capabilities.find('desktop,iphone')).toHaveLength(2)
    expect(capabilities.find(['desktop'])).toHaveLength(1)
    expect(capabilities.find('desktop')[0]).toBeInstanceOf(Chrome)
    expect(capabilities.find('nothing')).toHaveLength(0)
  })
})

describe('register(String, Object | Function)', () => {
  const obj = { deviceType: 'primitive' }
  const fn = () => obj

  beforeEach(() => {
    capabilities.register('flint', obj)
    capabilities.register('iron', fn)
  })

  test('adds capability to container', () => {
    expect(capabilities.find('flint,iron')).toContain(obj, obj)
  })
})

describe('new Device(Object)', () => {
  test('default browserName', () => {
    const device = new Chrome()

    expect(device.browserName).toEqual('chrome')
  })
})

describe('new Chrome(Object)', () => {
  test('default browserName', () => {
    const device = new Chrome()

    expect(device.browserName).toEqual('chrome')
  })

  test('coerces ChromeDriver args', () => {
    const input = {
      deviceType: 'deviceType',
      deviceName: 'deviceName',
      browserName: 'browserName',
      platform: 'platform',
      userAgent: 'userAgent',
      viewportSize: {
        width: 8,
        height: 8,
      },
    }
    const chromeOptions = [
      ...chromeDriverArgs(),
      '--disable-infobars',
      '--user-agent=userAgent',
      '--window-size=8,8',
    ]
    const device = new Chrome(input)

    expect(device).toMatchObject(input)
    expect(device.chromeOptions.args).toContain(...chromeOptions)
  })
})

describe('chromeDriverArgs()', () => {
  describe('when headless', () => {
    beforeEach(() => (process.env.VUE_CLI_WDIO_HEADLESS = '1'))

    test('includes --headless', () => {
      expect(chromeDriverArgs()).toContain('--headless')
    })

    afterEach(() => delete process.env.VUE_CLI_WDIO_HEADLESS)
  })

  describe('when debug and interactive', () => {
    beforeEach(() => (process.env.VUE_CLI_WDIO_DEBUG = '1'))

    test('includes --remote-debugging-port', () => {
      expect(chromeDriverArgs()).toContain(`--remote-debugging-port=${process.debugPort}`)
    })

    afterEach(() => delete process.env.VUE_CLI_WDIO_DEBUG)
  })
})
