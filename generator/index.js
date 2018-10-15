module.exports = api => {
  api.extendPackage({
    scripts: {
      "test:e2e": "vue-cli-service test:e2e"
    }
  })
}
