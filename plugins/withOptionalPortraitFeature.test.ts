// Google Play rejected the 1.4.0 (60) closed-test release because the portrait
// orientation lock makes Android imply a REQUIRED
// android.hardware.screen.portrait feature. This plugin declares it optional;
// the tests pin the exact manifest output, with literal values on purpose.
import withOptionalPortraitFeature, {
  setPortraitFeatureOptional,
} from './withOptionalPortraitFeature';

jest.mock('expo/config-plugins', () => ({
  // Run the mod immediately instead of queueing it for a prebuild.
  withAndroidManifest: (config: object, action: (cfg: object) => object) => action(config),
}));

interface UsesFeature {
  $: Record<string, string>;
}
interface Manifest {
  'uses-feature'?: UsesFeature[];
  application?: object[];
}

const portrait = (required: string): UsesFeature => ({
  $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': required },
});
const camera: UsesFeature = {
  $: { 'android:name': 'android.hardware.camera', 'android:required': 'true' },
};

describe('setPortraitFeatureOptional', () => {
  it('adds an optional portrait feature when the manifest declares none', () => {
    const manifest: Manifest = {};

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([
      { $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': 'false' } },
    ]);
  });

  it('flips an existing required portrait feature to optional', () => {
    const manifest: Manifest = { 'uses-feature': [portrait('true')] };

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([portrait('false')]);
  });

  it('flips a portrait feature that has no required attribute at all', () => {
    const manifest: Manifest = {
      'uses-feature': [{ $: { 'android:name': 'android.hardware.screen.portrait' } }],
    };

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([portrait('false')]);
  });

  it('does not duplicate the entry when run a second time', () => {
    const manifest: Manifest = {};

    setPortraitFeatureOptional(manifest);
    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([portrait('false')]);
  });

  it('leaves other uses-feature entries untouched and appends the portrait one', () => {
    const manifest: Manifest = { 'uses-feature': [camera] };

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([camera, portrait('false')]);
  });

  it('keeps unrelated entries in place when flipping an existing portrait feature', () => {
    const manifest: Manifest = { 'uses-feature': [camera, portrait('true')] };

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([camera, portrait('false')]);
  });

  it('marks every duplicate portrait entry optional', () => {
    const manifest: Manifest = { 'uses-feature': [portrait('true'), portrait('true')] };

    setPortraitFeatureOptional(manifest);

    expect(manifest['uses-feature']).toEqual([portrait('false'), portrait('false')]);
  });

  it('does not touch the rest of the manifest', () => {
    const application = [{ $: { 'android:name': '.MainApplication' } }];
    const manifest: Manifest = { application };

    setPortraitFeatureOptional(manifest);

    expect(manifest.application).toBe(application);
  });

  it('returns the manifest it was given', () => {
    const manifest: Manifest = {};

    expect(setPortraitFeatureOptional(manifest)).toBe(manifest);
  });
});

describe('withOptionalPortraitFeature', () => {
  it('applies the change to the Android manifest and returns the config', () => {
    const manifest: Manifest = { 'uses-feature': [portrait('true')] };
    const config = { modResults: { manifest } };

    const result = withOptionalPortraitFeature(config);

    expect(result).toBe(config);
    expect(manifest['uses-feature']).toEqual([portrait('false')]);
  });
});
