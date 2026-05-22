const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Only load the Storybook Metro plugin when explicitly enabled.
// Importing withStorybook unconditionally pulls in storybook/internal/* at
// Node.js require-time, which can fail in CI environments (e.g. Linux runners)
// that don't have all the native dependencies those packages expect.
if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
  module.exports = withStorybook(config, {
    enabled: true,
    configPath: './.rnstorybook',
  });
} else {
  module.exports = config;
}
