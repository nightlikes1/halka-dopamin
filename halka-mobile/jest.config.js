// Jest yapılandırması: domain ve data testleri saf TypeScript olarak çalışır
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/fakes/'],
  // jest-expo varsayılanı + @dicebear (ESM paketleri dönüştürülmeli)
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@dicebear))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/data/**/*.ts', '!src/data/services/**'],
};
