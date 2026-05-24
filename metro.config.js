const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

// When Storybook is disabled, redirect any require of the .rnstorybook directory
// to an empty stub.  Metro resolves every require() at bundle time — including
// those inside dead-code branches that Babel DCE has not yet eliminated — so
// without this guard the full Storybook dependency tree would end up in the
// production bundle whenever the conditional require('./.rnstorybook') is
// encountered.
if (!storybookEnabled) {
  const stubPath = path.resolve(__dirname, 'storybook-stub.js');
  config.resolver = config.resolver ?? {};
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName.includes('.rnstorybook')) {
      return { filePath: stubPath, type: 'sourceFile' };
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

// Only load the Storybook Metro plugin when explicitly enabled.
// Importing withStorybook unconditionally pulls in storybook/internal/* at
// Node.js require-time, which can fail in CI environments (e.g. Linux runners)
// that don't have all the native dependencies those packages expect.
if (storybookEnabled) {
  const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
  module.exports = withStorybook(config, {
    enabled: true,
    configPath: './.rnstorybook',
  });
} else {
  module.exports = config;
}
