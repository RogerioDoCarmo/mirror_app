import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MirrorScreen } from '@/screens/MirrorScreen';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { LocaleProvider } from '@/application/providers/LocaleProvider';

/**
 * Root application component.
 *
 * Wraps the app tree with {@link LocaleProvider} (OS language detection and
 * translations) and {@link CameraProvider} (camera permission adapter), then
 * renders {@link MirrorScreen} with a light status bar.
 */
export default function App() {
  return (
    <LocaleProvider>
      <CameraProvider>
        <MirrorScreen />
        <StatusBar style="light" />
      </CameraProvider>
    </LocaleProvider>
  );
}
