const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Strips Android permissions that bundled libraries inject but Miroji does not
 * use, keeping the released manifest minimal and consistent with the app's
 * privacy posture: a front-camera mirror that records, stores, and sends
 * nothing.
 *
 * Uses the Android manifest merger's `tools:node="remove"` directive so each
 * permission is removed from the FINAL merged manifest regardless of which
 * dependency declares it:
 *   - RECORD_AUDIO          → expo-camera
 *   - SYSTEM_ALERT_WINDOW   → React Native debug / dev tooling
 *   - DUMP                  → dev tooling
 *   - READ/WRITE_EXTERNAL_STORAGE → expo-file-system (legacy storage)
 */
const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.DUMP',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

const TOOLS_NAMESPACE = 'http://schemas.android.com/tools';

module.exports = function withCleanAndroidPermissions(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Ensure the `tools` namespace is declared on <manifest> so the merger
    // understands `tools:node="remove"`.
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = TOOLS_NAMESPACE;

    const existing = manifest['uses-permission'] || [];

    // Drop any direct declarations of the unwanted permissions, then re-add
    // each as an explicit remove marker so library-injected copies are also
    // stripped from the merged manifest.
    const cleaned = existing.filter(
      (perm) => !PERMISSIONS_TO_REMOVE.includes(perm && perm.$ && perm.$['android:name'])
    );

    for (const name of PERMISSIONS_TO_REMOVE) {
      cleaned.push({ $: { 'android:name': name, 'tools:node': 'remove' } });
    }

    manifest['uses-permission'] = cleaned;
    return cfg;
  });
};
