/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    node: true,
    es2021: true,
  },

  parserOptions: {
    requireConfigFile: false,
  },

  extends: ['@react-native'],

  ignorePatterns: [
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    '.eslintrc.js',
  ],
};
