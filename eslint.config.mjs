import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/', '*.test.js'],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypescript
    },
    rules: {
      'no-unused-vars': 'warn',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];