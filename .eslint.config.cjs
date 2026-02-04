// Project ESLint config to augment Expo's base with stricter TypeScript rules
// Uses Flat config under the hood but we keep a simple CJS export for compatibility

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  ignorePatterns: ['dist/**', 'android/**', 'ios/**', '.expo/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/self-closing-comp': 'warn',
    'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
