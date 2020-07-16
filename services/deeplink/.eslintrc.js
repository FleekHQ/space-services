const { eslint } = require('@packages/devtools');

eslint.extends.push('plugin:react/recommended')

module.exports = eslint;