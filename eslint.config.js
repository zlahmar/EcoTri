const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');

module.exports = [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/jsx-uses-react': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['src/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'react/jsx-uses-react': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
];