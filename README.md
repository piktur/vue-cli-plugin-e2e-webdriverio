# vue-cli-plugin-e2e-webdriverio

> e2e-webdriver plugin for vue-cli

## Injected Commands

Run e2e tests with [WebdriverIO](http://webdriver.io/) `yarn run test:e2e [options]`

Options:

```sh

  -b, --baseUrl             Run e2e tests against given url instead of auto-starting dev server
  --capabilities            Specify comma-delimited browser capabilities to run (default: chrome)
  --config                  Use your own WebdriverIO configuration (overrides plugin defaults)
  --headless, --no-headless Run e2e tests in headless mode without GUI (compatible with default chrome capability)
  --debug, --no-debug       Enable Node inspector and debugging tools
  --specs                   Glob pattern determines specs to run (relative to <projectRoot>)

```

Additionally, all [WebdriverIO CLI](https://github.com/webdriverio/webdriverio/blob/master/packages/wdio-cli/src/config.js) options are supported.

By default, tests are run in **interactive** mode, to run in **headless** mode (for **CI**) use option `--headless`.

Defaults defined on *plugin invokation* will be stored in `vue.config.js`.
Defaults will be overriden by command line options on *command invokation*.

## Configuration

This plugin uses the **Chrome driver** by default. If you wish to run e2e tests with additional *capabilities*, define configuration within `<projectRoot>/wdio.conf.js`.
Settings defined at this path will be **merged** with the plugin's defaults.

If no alternate `--config` defined the plugin will install and configure:

* [`mocha` framework](https://mochajs.org/)
* [`chai` assertions library](https://www.chaijs.com/)
* [`sinon` mocks library](https://sinonjs.org/)

To **override internal configuration entirely** use option `--config` to specify alternate configuration file.
In this case, the plugin makes no assumptions; **installation and configuration of framework dependencies will be your responsibility**;
if you haven't already, run `./node_modules/.bin/wdio` to configure `WebdriverIO`.

The plugin's internal `WebdriverIO` configuration is exported as `baseConfig`, utility methods, as `util`:

* `resizeViewport()`
* `saveScreenshot(test)`
* `printBrowserConsole()`

Selenium commands will be executed **synchronously** by default. To override:

```js
  // wdio.conf.js
  exports.config = {
    sync: false
    // ...
  }
```

`WebdriverIO` hooks defined in `<projectRoot>/wdio.conf.js` will be appended to behaviour provided by plugin defaults.

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

## Installing in an Already Created Project

**Commit** your project and run `vue add vue-cli-plugin-e2e-webdriver`
