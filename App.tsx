import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MirrorScreen } from '@/screens/MirrorScreen';
import { CameraProvider } from '@/application/providers/CameraProvider';

/**
 * Root application component.
 *
 * Wraps the app tree with {@link CameraProvider} so that any descendant can
 * access the camera permission port via `useCameraPermission`, then renders
 * {@link MirrorScreen} with a light status bar.
 */
export default function App() {
  return (
    <CameraProvider>
      <MirrorScreen />
      <StatusBar style="light" />
    </CameraProvider>
  );
}
