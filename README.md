# vue-cli-plugin-e2e-webdriverio

> e2e-webdriver plugin for vue-cli

## Injected Commands

`vue-cli-service test:e2e`

Run e2e tests with [WebdriverIO](http://webdriver.io/)

Options:

```sh

  --url        # run e2e tests against given url instead of auto-starting dev server
  --config     # use custom webdriver config file (overrides internals)
  -e, --env    # specify comma-delimited browser envs to run in (default: chrome)
  -t, --test   # specify a test to run by name
  -f, --filter # glob to filter tests by filename

```

Additionally, all Webdriver CLI options are also supported.

## Configuration

This plugin uses the **Chrome** driver by default. If you wish to run e2e tests in additional browsers, add configuration to `wdio.conf.js` at project root.
Configuration defined at this path will be merged with the internal `Webdriver` config.

Or, override internal configuration entirely passing the alternate configuration file path to `--config` option.

Consult [WebdriverIO Configuration](http://webdriver.io/guide/getstarted/configuration.html) for available options and browser configuration.

## Installing in an Already Created Project

`vue add vue-cli-plugin-e2e-webdriver`
