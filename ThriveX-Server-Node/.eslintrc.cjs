require('dotenv').config();

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
  },
  overrides: [
    {
      // 针对 CommonJS 配置文件，使用默认解析器避免误报 module/require
      files: ['*.cjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'script',
      },
      env: {
        node: true,
        commonjs: true,
      },
      rules: {
        // CommonJS 文件允许使用 require
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
