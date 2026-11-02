// The Android mirror toggle depends on patches/expo-camera.patch (the preview
// must be a TextureView, or the parent's scaleX = -1 is ignored). Expo SDK 54
// builds each Android module from a PREBUILT AAR by default, which silently
// ignores a patch to the module's Kotlin source: the 1.3.6 (58) Firebase build
// shipped with the patch applied to node_modules and the toggle still did
// nothing on a Poco. Compiling expo-camera from source is what makes the patch
// reach the APK, so that setting is pinned here.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

interface PackageJson {
  expo?: { autolinking?: { android?: { buildFromSource?: string[] } } };
  pnpm?: { patchedDependencies?: Record<string, string> };
}

const PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as PackageJson;

describe('expo-camera patch reaches the Android build', () => {
  it('patches expo-camera', () => {
    expect(PACKAGE.pnpm?.patchedDependencies?.['expo-camera']).toBe('patches/expo-camera.patch');
  });

  it('makes the patch a TextureView preview in ExpoCameraView', () => {
    const patch = fs.readFileSync(path.join(ROOT, 'patches', 'expo-camera.patch'), 'utf8');
    expect(patch).toContain('ExpoCameraView.kt');
    expect(patch).toContain('PreviewView.ImplementationMode.COMPATIBLE');
  });

  it('compiles expo-camera from source instead of using its prebuilt AAR', () => {
    const patterns = PACKAGE.expo?.autolinking?.android?.buildFromSource ?? [];
    // Expo matches each pattern against the whole Gradle project name.
    expect(
      patterns.some((pattern) => new RegExp(`^(?:${pattern})$`, 'u').test('expo-camera')),
    ).toBe(true);
  });
});
