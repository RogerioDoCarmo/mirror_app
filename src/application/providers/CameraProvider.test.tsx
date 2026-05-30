import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { CameraProvider, useCameraPermission } from './CameraProvider';

jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);

const mockPort = {
  permission: { granted: true, canAskAgain: true },
  requestPermission: jest.fn(),
};

describe('CameraProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoCameraPermission.mockReturnValue(mockPort);
  });

  it('provides the adapter value to consumers via useCameraPermission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(CameraProvider, null, children);

    const { result } = renderHook(() => useCameraPermission(), { wrapper });

    expect(result.current.permission).toEqual({ granted: true, canAskAgain: true });
  });

  it('useCameraPermission throws when called outside a CameraProvider', () => {
    // Suppress the expected React error boundary output in the test console.
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useCameraPermission())).toThrow(
      'useCameraPermission must be used inside a <CameraProvider>',
    );

    consoleSpy.mockRestore();
  });
});
