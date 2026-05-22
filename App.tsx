import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MirrorScreen } from '@/screens/MirrorScreen';

/** Root application component. Renders {@link MirrorScreen} with a light status bar. */
export default function App() {
  return (
    <>
      <MirrorScreen />
      <StatusBar style="light" />
    </>
  );
}
