const Device = require('./Device')
const { isHeadless, isInteractive } = require('../util')

const portPos = process.argv.indexOf('--port')
const port = process.argv[portPos + 1]

// https://peter.sh/experiments/chromium-command-line-switches
const chromeDriverArgs = module.exports.chromeDriverArgs = [
  '--url-base=/wd/hub',
  // https://github.com/Codeception/CodeceptJS/issues/561
  `--proxy-server='direct://'`,
  '--proxy-bypass-list=*',
  `--port=${port}`,
]

if (isHeadless) {
  chromeDriverArgs.push('--headless')
} else {
  chromeDriverArgs.push(`--remote-debugging-port=${process.debugPort}`)
}

module.exports.Chrome = class Chrome extends Device {
  constructor(opts) {
    super(opts)

    this.chromeOptions = {
      args: [
        ...chromeDriverArgs,
      ],
    }

    if (isInteractive) {
      const { width, height } = this.viewportSize
      this.chromeOptions.args.push(`--window-size=${width},${height}`)
    }
  }
}
