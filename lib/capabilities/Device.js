module.exports = class Device {
  constructor(opts) {
    this.browserName = 'chrome'
    this.pageLoadStrategy = 'none' // do not wait for resources to load before continuing test

    Object.assign(this, opts)
  }
}
