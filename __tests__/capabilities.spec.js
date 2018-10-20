const { Chrome, chromeDriverArgs } = require('../lib/capabilities/Chrome')
const { get } = require('../lib/capabilities')

test('should expose predefined capabilities', () => {
  const capabilities = require('../lib/capabilities')
  const names = capabilities.capabilityNames

  names.forEach((name) => expect(name in capabilities))
})

describe('get(String | String[])', () => {
  test('returns predefined capabilities', () => {
    expect(get('desktop,iphone')).toHaveLength(2)
    expect(get(['desktop'])).toHaveLength(1)
    expect(get('desktop')[0]).toBeInstanceOf(Chrome)
    expect(get('nothing')).toHaveLength(0)
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
