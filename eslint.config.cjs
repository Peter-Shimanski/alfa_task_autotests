const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'compiled/**',
      'playwright-report/**',
      'test-results/**',
      'allure-report/**',
      'allure-results/**'
    ]
  },
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: typescriptParser
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off'
    }
  },
  eslintConfigPrettier
];
