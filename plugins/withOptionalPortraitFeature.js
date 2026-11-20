const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Declares the portrait screen as an OPTIONAL hardware feature, so Google Play
 * does not filter the app out of devices that cannot guarantee portrait.
 *
 * `app.json` locks Miroji to portrait (`"orientation": "portrait"`), which
 * gives the main activity `android:screenOrientation="portrait"`. When a
 * manifest requests a fixed orientation and says nothing about the matching
 * feature, Android implies
 * `<uses-feature android:name="android.hardware.screen.portrait" android:required="true"/>`.
 * Play Console reads that as a hard requirement and rejects the release with
 * "required hardware feature declarations are restricting app availability"
 * (it names Phone, Tablet, Desktop and Android XR), which blocked the 1.4.0
 * (60) closed-test rollout.
 *
 * Declaring the feature explicitly with `android:required="false"` replaces the
 * implied requirement. The portrait lock itself is untouched: the activity still
 * opens in portrait, and the manifest simply stops promising that every
 * installing device can rotate to it.
 *
 * The edit is idempotent. It flips an existing entry to optional instead of
 * adding a second one, and leaves every other `uses-feature` entry as it was.
 */
const PORTRAIT_FEATURE = 'android.hardware.screen.portrait';

/**
 * Marks the portrait screen feature as not required in a parsed manifest.
 *
 * @param {{ 'uses-feature'?: Array<{ $: Record<string, string> }> }} manifest The
 *   parsed `<manifest>` element from `@expo/config-plugins`.
 * @returns {object} The same manifest, with the portrait feature set to optional.
 */
function setPortraitFeatureOptional(manifest) {
  const features = manifest['uses-feature'] ?? [];
  const portrait = features.filter((feature) => feature.$['android:name'] === PORTRAIT_FEATURE);

  if (portrait.length === 0) {
    features.push({ $: { 'android:name': PORTRAIT_FEATURE, 'android:required': 'false' } });
  } else {
    portrait.forEach((feature) => {
      feature.$['android:required'] = 'false';
    });
  }

  manifest['uses-feature'] = features;
  return manifest;
}

module.exports = function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (cfg) => {
    setPortraitFeatureOptional(cfg.modResults.manifest);
    return cfg;
  });
};

module.exports.setPortraitFeatureOptional = setPortraitFeatureOptional;
