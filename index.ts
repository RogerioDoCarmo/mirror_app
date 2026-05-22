import { registerRootComponent } from 'expo';
import App from './App';

// Set EXPO_PUBLIC_STORYBOOK_ENABLED=true in .env.local (and run `pnpm storybook`)
// to launch the on-device Storybook UI instead of the real application.
//
// Using require() rather than a static import keeps the .rnstorybook module
// tree (including require.context) completely out of regular builds — Metro
// only bundles what is actually reachable in the executed branch.
if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
  const StorybookUIRoot = require('./.rnstorybook').default as Parameters<
    typeof registerRootComponent
  >[0];
  registerRootComponent(StorybookUIRoot);
} else {
  registerRootComponent(App);
}
