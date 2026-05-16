import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MirrorScreen } from '@/screens/MirrorScreen';

export default function App() {
  return (
    <>
      <MirrorScreen />
      <StatusBar style="light" />
    </>
  );
}
