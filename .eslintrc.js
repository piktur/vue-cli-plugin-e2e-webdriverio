module.exports = {
  env: {
    es6: true,
    node: true

  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2017,
    parser: 'babel-eslint',
  },
  plugins: [
    'node'
  ],
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never']
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': ['error', 'never'],
  }
}
