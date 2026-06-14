import React from 'react';
import type { Preview } from '@storybook/react-native-web-vite';
import { LocaleProvider } from '../src/application/providers/LocaleProvider';

/**
 * Web Storybook preview config.
 *
 * Every story is wrapped in a {@link LocaleProvider} so components that call
 * `useLocale()` (e.g. PermissionGate) render without throwing — the on-device
 * app provides this at the root, so the web build must too.
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#000000' },
        light: { name: 'light', value: '#FFFFFF' },
        blue: { name: 'blue', value: '#80BBFC' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
};

export default preview;
