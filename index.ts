import { registerRootComponent } from 'expo';

import App from './App';
import StorybookUIRoot from './.rnstorybook';

// Set EXPO_PUBLIC_STORYBOOK_ENABLED=true in .env.local to launch the on-device
// Storybook UI. When the flag is false the metro.config.js withStorybook wrapper
// replaces the .rnstorybook module with a no-op stub, so production builds are
// unaffected by this import.
const Root = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true' ? StorybookUIRoot : App;

registerRootComponent(Root);
