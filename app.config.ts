import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Dynamic Expo config.
 *
 * All static values live in app.json and are forwarded via the `config` parameter.
 * The only thing this file does is allow `newArchEnabled` to be overridden at build
 * time via an environment variable: `EXPO_NO_NEW_ARCH=1` → `newArchEnabled: false`.
 *
 * The `e2e` EAS build profile sets this variable so Maestro tests run against the
 * classic (Paper/Bridge) renderer.  Fabric (New Architecture) is production-ready for
 * this app, but Maestro's XCTest / UIAutomator drivers have known issues resolving
 * testIDs on the Fabric renderer in CI emulators, causing `extendedWaitUntil` to time
 * out even when elements are actually visible.
 *
 * Every other profile (development, preview, production) leaves `EXPO_NO_NEW_ARCH`
 * unset, so New Architecture stays enabled everywhere except the E2E pipeline.
 */
export default ({ config }: ConfigContext): ExpoConfig =>
  // The spread widens every field to optional, but `config` is a full ExpoConfig
  // (with required `name`, `slug`, etc.) so the cast is safe.
  ({ ...config, newArchEnabled: process.env.EXPO_NO_NEW_ARCH !== '1' }) as ExpoConfig;
