import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { view } from './storybook.requires';

// Use a plain in-memory store instead of AsyncStorage so Storybook works in
// both Expo Go and dev builds without requiring the AsyncStorage native module.
const memoryStorage: Record<string, string> = {};
const storage = {
  getItem: (key: string) => Promise.resolve(memoryStorage[key] ?? null),
  setItem: (key: string, value: string) => {
    memoryStorage[key] = value;
    return Promise.resolve();
  },
};

const StorybookBase = view.getStorybookUI({ storage });

function StorybookUIRoot() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StorybookBase />
    </GestureHandlerRootView>
  );
}

export default StorybookUIRoot;
