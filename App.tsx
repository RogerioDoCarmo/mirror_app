import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MirrorScreen } from '@/screens/MirrorScreen';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { HintStoreProvider } from '@/application/providers/HintStoreProvider';
import { LocaleProvider } from '@/application/providers/LocaleProvider';

/**
 * Root application component.
 *
 * Wraps the app tree with {@link SafeAreaProvider} (insets for the floating
 * control buttons), {@link LocaleProvider} (OS language detection and
 * translations), {@link HintStoreProvider} (remembers that the zoom hint was
 * shown) and {@link CameraProvider} (camera permission adapter), then renders
 * {@link MirrorScreen} with a light status bar.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <HintStoreProvider>
          <CameraProvider>
            <MirrorScreen />
            <StatusBar style="light" />
          </CameraProvider>
        </HintStoreProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
