const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Strips Android permissions that bundled libraries inject but Miroji does not
 * use, keeping the RELEASE manifest minimal and consistent with the app's
 * privacy posture: a front-camera mirror that records, stores, and sends
 * nothing.
 *
 * The removals are written to a release-only source set
 * (`android/app/src/release/AndroidManifest.xml`), so they apply ONLY to
 * production/release builds. Development/debug builds are left untouched —
 * dev tooling that relies on these permissions keeps working, notably
 * SYSTEM_ALERT_WINDOW for the React Native dev menu / LogBox redbox /
 * performance overlay.
 *
 * Removed in release (via the manifest merger's `tools:node="remove"`):
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

function buildReleaseManifest() {
  const removals = PERMISSIONS_TO_REMOVE.map(
    (name) => `    <uses-permission android:name="${name}" tools:node="remove" />`,
  ).join('\n');
  return (
    '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n' +
    '    xmlns:tools="http://schemas.android.com/tools">\n' +
    `${removals}\n` +
    '</manifest>\n'
  );
}

module.exports = function withCleanAndroidPermissions(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      // android/app/src/release/AndroidManifest.xml — merged only for the
      // release build type, so debug/development builds are unaffected.
      const releaseDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'release');
      fs.mkdirSync(releaseDir, { recursive: true });
      fs.writeFileSync(path.join(releaseDir, 'AndroidManifest.xml'), buildReleaseManifest());
      return cfg;
    },
  ]);
};
