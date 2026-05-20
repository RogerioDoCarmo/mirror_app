import { renderHook } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useCameraPermissions } from 'expo-camera';
import type { PermissionResponse } from 'expo-camera';
import { useCamera } from './useCamera';

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
}));

const mockUseCameraPermissions = jest.mocked(useCameraPermissions);

// PermissionStatus is an opaque enum in expo-modules-core — cast each value to
// PermissionResponse['status'] so the arbitrary is compatible regardless of how
// the host environment resolves the enum. The .map() cast pins the output type
// to PermissionResponse, working around fc.record's interaction with
// exactOptionalPropertyTypes (which would otherwise make every field optional).
const permissionArb: fc.Arbitrary<PermissionResponse> = fc
  .record({
    granted: fc.boolean(),
    canAskAgain: fc.boolean(),
    expires: fc.constant('never'),
    status: fc.constantFrom(
      'granted' as PermissionResponse['status'],
      'denied' as PermissionResponse['status'],
      'undetermined' as PermissionResponse['status'],
    ),
  })
  .map((p) => p);

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
