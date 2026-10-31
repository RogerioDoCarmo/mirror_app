import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useExpoFileHintStore } from '@/adapters/expo-file-system/ExpoFileHintStoreAdapter';
import { HintStoreProvider, useHintStore } from './HintStoreProvider';

jest.mock('@/adapters/expo-file-system/ExpoFileHintStoreAdapter', () => ({
  useExpoFileHintStore: jest.fn(),
}));

const mockUseExpoFileHintStore = jest.mocked(useExpoFileHintStore);

const mockPort = {
  zoomHintSeen: true,
  markZoomHintSeen: jest.fn(),
};

describe('HintStoreProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoFileHintStore.mockReturnValue(mockPort);
  });

  it('provides the adapter value to consumers via useHintStore', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(HintStoreProvider, null, children);

    const { result } = renderHook(() => useHintStore(), { wrapper });

    expect(result.current).toBe(mockPort);
  });

  it('useHintStore throws when called outside a HintStoreProvider', () => {
    // Suppress the expected React error boundary output in the test console.
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useHintStore())).toThrow(
      'useHintStore must be used inside a <HintStoreProvider>',
    );

    consoleSpy.mockRestore();
  });
});
