import { renderHook } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useCameraPermissions } from 'expo-camera';
import type { PermissionResponse } from 'expo-camera';
import { useCamera } from './useCamera';

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
}));

const mockUseCameraPermissions = jest.mocked(useCameraPermissions);

const permissionArb = fc.record<PermissionResponse>({
  granted: fc.boolean(),
  canAskAgain: fc.boolean(),
  expires: fc.constantFrom('never' as const),
  status: fc.constantFrom('granted' as const, 'denied' as const, 'undetermined' as const),
});

const nullablePermissionArb = fc.option(permissionArb, { nil: null });

const mockRequestPermission = jest.fn();

describe('useCamera — property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always returns isReady=false on mount, for any initial permission state', () => {
    fc.assert(
      fc.property(nullablePermissionArb, (permission) => {
        mockUseCameraPermissions.mockReturnValue([permission, mockRequestPermission, jest.fn()]);

        const { result, unmount } = renderHook(() => useCamera());

        expect(result.current.isReady).toBe(false);

        unmount();
      }),
    );
  });

  it('always returns cameraRef.current=null on mount, for any initial permission state', () => {
    fc.assert(
      fc.property(nullablePermissionArb, (permission) => {
        mockUseCameraPermissions.mockReturnValue([permission, mockRequestPermission, jest.fn()]);

        const { result, unmount } = renderHook(() => useCamera());

        expect(result.current.cameraRef.current).toBeNull();

        unmount();
      }),
    );
  });

  it('always returns all required keys regardless of permission state', () => {
    fc.assert(
      fc.property(nullablePermissionArb, (permission) => {
        mockUseCameraPermissions.mockReturnValue([permission, mockRequestPermission, jest.fn()]);

        const { result, unmount } = renderHook(() => useCamera());

        expect(result.current).toHaveProperty('permission');
        expect(result.current).toHaveProperty('requestPermission');
        expect(result.current).toHaveProperty('cameraRef');
        expect(result.current).toHaveProperty('isReady');
        expect(result.current).toHaveProperty('onCameraReady');

        unmount();
      }),
    );
  });

  it('always reflects the permission value returned by useCameraPermissions', () => {
    fc.assert(
      fc.property(nullablePermissionArb, (permission) => {
        mockUseCameraPermissions.mockReturnValue([permission, mockRequestPermission, jest.fn()]);

        const { result, unmount } = renderHook(() => useCamera());

        expect(result.current.permission).toBe(permission);

        unmount();
      }),
    );
  });
});
