const debug = !!process.env.DEBUG
const IPHONE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1'

const portPos = process.argv.indexOf('--port')
const port = process.argv[portPos + 1]

// https://peter.sh/experiments/chromium-command-line-switches
const chromeDriverArgs = [
  '--url-base=/wd/hub',
  // https://github.com/Codeception/CodeceptJS/issues/561
  `--proxy-server='direct://'`,
  '--proxy-bypass-list=*',
  `--port=${port}`,
]

if (debug) {
  chromeDriverArgs.push(`--remote-debugging-port=${process.debugPort}`)
} else {
  chromeDriverArgs.push('--headless')
}

class Device {
  constructor(opts) {
    this.browserName = 'chrome'
    this.pageLoadStrategy = 'none' // do not wait for resources to load before continuing test

    Object.assign(this, opts)

    this.isMobile = this.cssDeviceType === 'mobile'
  }
}

class Chrome extends Device {
  constructor(opts) {
    super(opts)

    this.chromeOptions = {
      args: [
        ...chromeDriverArgs,
      ],
    }

    if (!debug) {
      const { width, height } = this.viewportSize
      this.chromeOptions.args.push(`--window-size=${width},${height}`)
    }

    if (this.isMobile) {
      this.chromeOptions.args.push(`--user-agent=${this.userAgent}`)
    }
  }
}

exports.phablet = new Chrome({
  cssDeviceType: 'phablet',
  viewportSize: {
    width: 1024,
    height: 768,
  },
})

exports.mobile = new Chrome({
  cssDeviceType: 'mobile',
  userAgent: IPHONE_USER_AGENT,
  viewportSize: {
    width: 320,
    height: 480,
  },
})

exports.capabilities = []
process.env.WDIO_CAPABILITIES.split(',').forEach(capability => {
  exports[capability] && exports.capabilities.push(exports[capability])
})

Object.assign(exports, { chromeDriverArgs, Device })
