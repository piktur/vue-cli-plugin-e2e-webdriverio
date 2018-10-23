# vue-cli-plugin-e2e-webdriverio

> e2e-webdriver plugin for vue-cli

## Injected Commands

Run e2e tests with [WebdriverIO](http://webdriver.io/)

```sh

  Usage:
    yarn run test:e2e [options]
    yarn run test:e2e
      --baseUrl http://localhost:8080
      --capabilities desktop,iphone
      --specs spec/**
      --headless
      --debug
      --mode development
    yarn run test:e2e --config wdio.conf.js
    yarn run test:e2e --suite focus --bail 1

  Options:
    -b, --baseUrl [STRING<URI>]      Run e2e tests against dev server running at given url. Auto starts dev server if absent.
    --capabilities [STRING[,STRING]] Specify browser capabilities to run (default: desktop)
    --config [STRING<PATH>]          Use your own WebdriverIO configuration; overrides plugin defaults (relative to <projectRoot>)
    --headless, --no-headless        Run e2e tests in headless mode without GUI (default capabilities only)
    --debug, --no-debug              Enable Node inspector and debugging tools
    --mode [STRING]                  Run the dev server in specified mode (default: production)
    --specs [STRING[,STRING]]        Glob pattern determines specs to run (relative to <projectRoot>)

```

Additionally, all [WebdriverIO CLI](https://github.com/webdriverio/webdriverio/blob/master/packages/wdio-cli/src/config.js) options are supported.

The *task* may also be run via `vue ui`.

## Configuration

Defaults defined on *plugin invokation* will be stored in `vue.config.js`.

Defaults will be overriden by command line options on *command invokation*.

Settings defined within `<projectRoot>/wdio.conf.js` will be **merged** with the plugin's defaults.

If no alternate `--config` defined the plugin will install and configure:

* [`mocha` framework](https://mochajs.org/)
* [`chai` assertions library](https://www.chaijs.com/)
* [`sinon` mocks library](https://sinonjs.org/)

To **override internal configuration entirely** use option `--config` to specify alternate configuration file.
In this case, the plugin makes no assumptions; **installation and configuration of framework dependencies will be your responsibility**;
if you haven't already, run `./node_modules/.bin/wdio` to configure `WebdriverIO`.

---

This plugin provides a number of `WebdriverIO` *capabilities* each utilising [`ChromeDriver`](http://chromedriver.chromium.org/). If you wish to run e2e tests with different *capabilities*, define them within `<projectRoot>/wdio.conf.js`.

When using `--capabilities` to run specs against a subset of devices, you must first [`registerCapability`](#capabilitiesregistercapabilityname-string-capability-object) within `<projectRoot>/wdio.conf.js`.

```js
  // wdio.conf.js
  const { registerCapability, Chrome } = require('vue-cli-plugin-e2e-webdriverio').capabilities()

  registerCapability('device', new Chrome({
    // ...options
  }))

  registerCapability('other', new Chrome({
    // ...options
  }))
```

Then you can run a subset of capabilities like so `yarn test:e2e --capabilities device`

---

By default, tests are run in **interactive** mode, to run in **headless** mode (for **CI**) use option `--headless`.

---

Selenium commands will be executed **synchronously** by default. To override:

```js
  // wdio.conf.js
  exports.config = {
    sync: false
    // ...
  }
```

---

`WebdriverIO` hooks defined in `<projectRoot>/wdio.conf.js` will be appended to behaviour provided by plugin defaults unless run with alternate `--config`.

```js
  // wdio.conf.js
  const plugin = require('vue-cli-plugin-e2e-webdriverio')
  const base = plugin.WDIOConfigDefault().config
  const { resizeViewport } = plugin.util()
  const { Chrome } = plugin.capabilties()

  exports.config = {
    ...base,
    // your overrides here...
    capabilities: [
      new Chrome({
        browserName: 'chrome',
        chromeOptions: {
          args: [
            '--headless',
            // etc...
          ]
        },
        viewportSize: {
          width: 1024,
          height: 768,
        },
        // etc...
      })
    ],

    beforeSuite: [
      resizeViewport,
      anotherFunction,
    ]

    // OR

    beforeSuite: (suite) => {
      resizeViewport()
      // your behaviour here...
    }
  }
```

Consult [WebdriverIO Configuration](http://webdriver.io/guide/getstarted/configuration.html) for available options and browser configuration.

---

## API

### `WDIOConfigDefault() : object`

Returns the plugin's internal `WebdriverIO` configuration.

### `capabilities() : object`

### `capabilities.Chrome`

#### `new(options)`

Constructor prepares `ChromeDriver` options from given input.

#### `viewportSize { width: number, height: number }`

#### `userAgent : string`

#### [`chromeOptions : object`](http://chromedriver.chromium.org/capabilities)

[`mobileEmulation : object`](http://chromedriver.chromium.org/mobile-emulation)

### `capabilities.get(names: string | string[]) : Array<object>`

Returns a list of registered capabilities matching given name(s).
Accepts a comma delimited list or Array.

### `capabilities.registerCapability(name: string, capability: object)`

Adds the named capability to the capabilities object.

### `capabilities.desktop(options: object) : capabilities.Chrome`

Returns the predefined capability.

### `capabilities.iphone(options: object) : capabilities.Chrome`

Returns the predefined capability.

### `capabilities.ipad(options: object) : capabilities.Chrome`

Returns the predefined capability.

### `capabilities.android(options: object) : capabilities.Chrome`

Returns the predefined capability.

### `util() : object`

### `util.resizeViewport() : void`

If current *capability* has property `viewportSize` this function will issue `WebdriverIO` command to resize the current browser *window* so that inner dimensions match `viewportSize`.

### `util.saveScreenshot(test: object) : void`

Saves screenshot to given `screenshotPath` or tmp directory and logs error info to stdout.

### `util.printBrowserConsole() : void`

Log all browser output to stdout.

---

## Installing in an Already Created Project

**Commit** your project and run `vue add vue-cli-plugin-e2e-webdriver`
