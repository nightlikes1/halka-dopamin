// ESLint (flat config): Expo kuralları + Prettier + katman sınırları
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Domain hiçbir dış katmana ve React/RN'e bağımlı olamaz
const domainForbidden = [
  'react',
  'react-native',
  'react-native-*',
  'expo',
  'expo-*',
  '@react-native-*/*',
  '@react-navigation/*',
  'zustand',
  'zod',
  '@data/*',
  '@presentation/*',
  '@core/di/*',
  '@core/theme/*',
];

// Data katmanı presentation ve DI'ı bilmez
const dataForbidden = ['react', 'react-native', '@presentation/*', '@core/di/*', '@core/theme/*'];

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'scripts/*', 'android/*', 'ios/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/features/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: domainForbidden, message: 'Domain katmanı dış katmanlara bağımlı olamaz.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/data/**/*.ts', 'src/features/*/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: dataForbidden,
              message: 'Data katmanı presentation/DI katmanını import edemez.',
            },
          ],
        },
      ],
    },
  },
]);
