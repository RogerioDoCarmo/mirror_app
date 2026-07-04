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
  async viteFinal(config) {
    // expo-modules-core's `export type * from './ts-declarations/global'` confuses
    // Vite's Rolldown-based dependency optimizer (it tries to bundle the
    // type-only stub files as real runtime code). Excluding it from
    // pre-bundling routes it through Vite's regular transform pipeline instead,
    // which handles the type-only re-export correctly.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude ?? []), 'expo-modules-core'],
    };
    return config;
  },
};

export default main;
