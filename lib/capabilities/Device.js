module.exports = class Device {
  constructor(opts) {
    this.browserName = 'chrome'

    Object.assign(this, opts)
  }
}
