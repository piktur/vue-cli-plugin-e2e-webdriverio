module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "jest": true,
  },
  "extends": ["plugin:vue-libs/recommended"],
  "parserOptions": {
    "ecmaVersion": 2017,
    "parser": "babel-eslint",
  },
  "plugins": [
    "node",
  ],
  "globals": {
    "browser": true,
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "comma-dangle": ["error", "always-multiline"],
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }],
  }
}
