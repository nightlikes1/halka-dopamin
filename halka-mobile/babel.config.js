// Babel yapılandırması: Expo preset + katman alias'ları
// Not: Reanimated 4 / worklets eklentisini babel-preset-expo otomatik ekler.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            '@core': './src/core',
            '@domain': './src/domain',
            '@data': './src/data',
            '@presentation': './src/presentation',
            '@features': './src/features',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
