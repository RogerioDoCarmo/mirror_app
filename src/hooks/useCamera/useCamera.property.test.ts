import React from 'react';
import { renderHook } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import type { PermissionState } from '@/core/domain/permission';
import { useCamera } from './useCamera';

jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);

// Arbitrary that produces any valid PermissionState (including null).
const permissionStateArb: fc.Arbitrary<PermissionState> = fc.option(
  fc.record({
    granted: fc.boolean(),
    canAskAgain: fc.boolean(),
  }),
  { nil: null },
);

const mockRequestPermission = jest.fn();

// Wrap the hook under test inside CameraProvider so the adapter mock is wired
// through context, mirroring the production setup.
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CameraProvider, null, children);

describe('useCamera — property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always returns isReady=false on mount, for any initial permission state', () => {
    fc.assert(
      fc.property(permissionStateArb, (permission) => {
        mockUseExpoCameraPermission.mockReturnValue({
          permission,
          requestPermission: mockRequestPermission,
        });

        const { result, unmount } = renderHook(() => useCamera(), { wrapper });

        expect(result.current.isReady).toBe(false);

        unmount();
      }),
    );
  });

  it('always returns cameraRef.current=null on mount, for any initial permission state', () => {
    fc.assert(
      fc.property(permissionStateArb, (permission) => {
        mockUseExpoCameraPermission.mockReturnValue({
          permission,
          requestPermission: mockRequestPermission,
        });

        const { result, unmount } = renderHook(() => useCamera(), { wrapper });

        expect(result.current.cameraRef.current).toBeNull();

        unmount();
      }),
    );
  });

  it('always returns all required keys regardless of permission state', () => {
    fc.assert(
      fc.property(permissionStateArb, (permission) => {
        mockUseExpoCameraPermission.mockReturnValue({
          permission,
          requestPermission: mockRequestPermission,
        });

        const { result, unmount } = renderHook(() => useCamera(), { wrapper });

        expect(result.current).toHaveProperty('permission');
        expect(result.current).toHaveProperty('requestPermission');
        expect(result.current).toHaveProperty('cameraRef');
        expect(result.current).toHaveProperty('isReady');
        expect(result.current).toHaveProperty('onCameraReady');

        unmount();
      }),
    );
  });

  it('always reflects the permission value provided by the port', () => {
    fc.assert(
      fc.property(permissionStateArb, (permission) => {
        mockUseExpoCameraPermission.mockReturnValue({
          permission,
          requestPermission: mockRequestPermission,
        });

        const { result, unmount } = renderHook(() => useCamera(), { wrapper });

        // The hook passes the port's permission through unchanged; reference
        // equality holds because no transformation is applied at this layer.
        expect(result.current.permission).toBe(permission);

        unmount();
      }),
    );
  });
});
