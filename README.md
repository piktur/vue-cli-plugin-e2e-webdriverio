# vue-cli-plugin-e2e-webdriverio

> e2e-webdriver plugin for vue-cli

## Injected Commands

`vue-cli-service test:e2e`

Run e2e tests with [WebdriverIO](http://webdriver.io/)

Options:

```sh

  --url        # run e2e tests against given url instead of auto-starting dev server
  --config     # use custom webdriver config file (overrides internals)
  --headless   # run e2e tests in headless mode without GUI
  -e, --env    # specify comma-delimited browser envs to run in (default: chrome)
  -t, --test   # specify a test to run by name
  -f, --filter # glob to filter tests by filename

```

Additionally, all Webdriver CLI options are also supported.

By default, tests are run in interactive mode, to run in **headless** mode (for **CI**) use option `--headless`.

## Configuration

This plugin uses the **Chrome** driver by default. If you wish to run e2e tests in additional browsers, define configuration within `<projectRoot>/wdio.conf.js`.
Configuration defined at this path will be merged with the internal `Webdriver` config.

Or, to override internal configuration entirely pass use option `--config` to specify alternate configuration file.

Consult [WebdriverIO Configuration](http://webdriver.io/guide/getstarted/configuration.html) for available options and browser configuration.

## Installing in an Already Created Project

`vue add vue-cli-plugin-e2e-webdriver`
