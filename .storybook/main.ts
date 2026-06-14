import type { StorybookConfig } from '@storybook/react-native-web-vite';

/**
 * Web Storybook configuration.
 *
 * This is the *web* build of Storybook (rendered through react-native-web via
 * Vite) used for Chromatic visual tests and the published Storybook. The
 * on-device React Native Storybook lives separately in `../.rnstorybook`.
 *
 * Both configs share the same `*.stories.tsx` files under `src/`.
 */
const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
};

export default main;
