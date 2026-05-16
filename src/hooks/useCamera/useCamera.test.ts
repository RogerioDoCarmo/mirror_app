import { renderHook, act } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import type { PermissionResponse } from 'expo-camera';
import { useCamera } from './useCamera';

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
}));

const mockUseCameraPermissions = jest.mocked(useCameraPermissions);

type PermissionStatus = PermissionResponse['status'];

const makePermission = (
  overrides: Partial<Omit<PermissionResponse, 'status'>> & { status?: PermissionStatus } = {},
): PermissionResponse => ({
  granted: false,
  canAskAgain: true,
  expires: 'never',
  status: 'undetermined' as PermissionStatus,
  ...overrides,
});

describe('useCamera', () => {
  const mockRequestPermission = jest.fn().mockResolvedValue(makePermission({ granted: true }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null permission while loading', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.permission).toBeNull();
  });

  it('returns permission when granted', () => {
    const granted = makePermission({ granted: true, status: 'granted' as PermissionStatus });
    mockUseCameraPermissions.mockReturnValue([granted, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.permission?.granted).toBe(true);
  });

  it('returns permission when denied', () => {
    const denied = makePermission({
      granted: false,
      canAskAgain: true,
      status: 'denied' as PermissionStatus,
    });
    mockUseCameraPermissions.mockReturnValue([denied, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.permission?.granted).toBe(false);
    expect(result.current.permission?.canAskAgain).toBe(true);
  });

  it('exposes the requestPermission function from expo-camera', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.requestPermission).toBe(mockRequestPermission);
  });

  it('starts with isReady as false', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.isReady).toBe(false);
  });

  it('sets isReady to true after onCameraReady is called', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    act(() => {
      result.current.onCameraReady();
    });

    expect(result.current.isReady).toBe(true);
  });

  it('provides a stable cameraRef object', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission, jest.fn()]);

    const { result } = renderHook(() => useCamera());

    expect(result.current.cameraRef).toBeDefined();
    expect(result.current.cameraRef.current).toBeNull();
  });
});
