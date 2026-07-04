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
    // expo-modules-core's src/ts-declarations/*.ts files exist purely for
    // TypeScript's `declare global` augmentation (consumed via the type-only
    // `export type * from './ts-declarations/global'` in its index.ts) and
    // have no runtime behavior. But neither Vite's Rolldown-based dependency
    // optimizer nor its per-file dev transform can tell that `global.ts`'s
    // own imports of `./EventEmitter`, `./NativeModule`, `./SharedObject` and
    // `./SharedRef` are type-only, so they get served as real modules that
    // don't actually export the values they claim to. That fails with either
    // a MISSING_EXPORT build crash (optimizer) or a silent ES-module linking
    // SyntaxError at runtime (dev transform) that never reaches the console
    // and just leaves the story canvas stuck loading forever. Stubbing the
    // whole ts-declarations folder out sidesteps both failure modes.
    //
    // Rolldown (the optimizer's bundler) doesn't honor this plugin's
    // resolveId/load hooks, so expo-modules-core must also stay excluded from
    // pre-bundling to dodge the same MISSING_EXPORT error there. That exclude
    // has a side effect though: Vite's scanner stops crawling through
    // expo-modules-core, so `invariant` — a CJS-only dep reachable *only* via
    // expo-modules-core's LegacyEventEmitter.ts — never gets discovered and
    // pre-bundled with proper ESM interop, which fails the same "does not
    // provide an export named default" way. pnpm's isolated node_modules
    // layout also blocks Vite's usual `optimizeDeps.include` / `pkg > dep`
    // resolution from locating it, so it's stubbed directly below instead.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude ?? []), 'expo-modules-core'],
    };
    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: 'stub-expo-modules-core-ts-declarations',
        enforce: 'pre',
        resolveId(source: string, importer?: string) {
          if (source === 'invariant') {
            return '\0stub-invariant';
          }
          const importerDir = importer ? importer.replace(/\/[^/]*$/, '') : '';
          const resolved = source.startsWith('.') ? `${importerDir}/${source}` : source;
          if (resolved.includes('/ts-declarations/') || source.includes('ts-declarations/')) {
            return '\0stub-expo-modules-core-ts-declarations';
          }
          return null;
        },
        load(id: string) {
          if (id === '\0stub-expo-modules-core-ts-declarations') {
            return 'export {};';
          }
          if (id === '\0stub-invariant') {
            return `export default function invariant(condition, format, ...args) {
              if (!condition) {
                let i = 0;
                const message = format ? format.replace(/%s/g, () => String(args[i++])) : 'Invariant Violation';
                throw new Error(message);
              }
            };`;
          }
          return null;
        },
      },
    ];
    // The native android/ and ios/ folders are gitignored and regenerated on
    // demand (expo prebuild), but when present their build output churns
    // constantly. Vite's watcher picks that up and fires endless full-page
    // reloads, which looks like the story canvas is stuck loading.
    config.server = {
      ...config.server,
      watch: {
        ...config.server?.watch,
        ignored: [...(config.server?.watch?.ignored ?? []), '**/android/**', '**/ios/**'],
      },
    };
    return config;
  },
};

export default main;
