process.env.VUE_CLI_TEST = true

const path = require('path')
const glob = require('glob')
const files = glob.sync('__tests__/**/*.js')

function normalizePath(f) {
  if (path.isAbsolute(f)) {
    return path.normalize(f)
  } else {
    return path.resolve(process.cwd(), f)
  }
}

files.map(normalizePath).forEach(require)
