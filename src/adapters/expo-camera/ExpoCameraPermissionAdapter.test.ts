import { renderHook, act } from '@testing-library/react-native';
import { useCameraPermissions } from 'expo-camera';
import type { PermissionResponse } from 'expo-camera';
import { useExpoCameraPermission } from './ExpoCameraPermissionAdapter';

// This is the only test suite that may legitimately mock expo-camera —
// it is specifically testing the adapter that wraps it.
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
}));

const mockUseCameraPermissions = jest.mocked(useCameraPermissions);

type PermissionStatus = PermissionResponse['status'];

const makeRaw = (
  overrides: Partial<PermissionResponse> & { status?: PermissionStatus } = {},
): PermissionResponse => ({
  granted: false,
  canAskAgain: true,
  expires: 'never',
  status: 'undetermined' as PermissionStatus,
  ...overrides,
});

describe('useExpoCameraPermission', () => {
  const mockRawRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null permission while expo-camera returns null', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    expect(result.current.permission).toBeNull();
  });

  it('maps a granted PermissionResponse to PermissionState', () => {
    const raw = makeRaw({
      granted: true,
      canAskAgain: true,
      status: 'granted' as PermissionStatus,
    });
    mockUseCameraPermissions.mockReturnValue([raw, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    expect(result.current.permission).toEqual({ granted: true, canAskAgain: true });
  });

  it('maps a denied PermissionResponse to PermissionState', () => {
    const raw = makeRaw({
      granted: false,
      canAskAgain: true,
      status: 'denied' as PermissionStatus,
    });
    mockUseCameraPermissions.mockReturnValue([raw, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    expect(result.current.permission).toEqual({ granted: false, canAskAgain: true });
  });

  it('maps a blocked PermissionResponse to PermissionState', () => {
    const raw = makeRaw({
      granted: false,
      canAskAgain: false,
      status: 'denied' as PermissionStatus,
    });
    mockUseCameraPermissions.mockReturnValue([raw, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    expect(result.current.permission).toEqual({ granted: false, canAskAgain: false });
  });

  it('strips extra expo-camera fields — only exposes granted and canAskAgain', () => {
    const raw = makeRaw({
      granted: true,
      canAskAgain: true,
      status: 'granted' as PermissionStatus,
    });
    mockUseCameraPermissions.mockReturnValue([raw, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    // The domain object must not leak expo-specific fields such as `status` or `expires`.
    expect(result.current.permission).toStrictEqual({ granted: true, canAskAgain: true });
  });

  it('requestPermission resolves with the mapped PermissionState', async () => {
    const rawResult = makeRaw({
      granted: true,
      canAskAgain: true,
      status: 'granted' as PermissionStatus,
    });
    mockRawRequest.mockResolvedValue(rawResult);
    mockUseCameraPermissions.mockReturnValue([null, mockRawRequest, jest.fn()]);

    const { result } = renderHook(() => useExpoCameraPermission());

    let resolved: Awaited<ReturnType<typeof result.current.requestPermission>>;
    await act(async () => {
      resolved = await result.current.requestPermission();
    });

    expect(resolved!).toEqual({ granted: true, canAskAgain: true });
    expect(mockRawRequest).toHaveBeenCalledTimes(1);
  });

  it('requestPermission produces a stable reference across re-renders', () => {
    mockUseCameraPermissions.mockReturnValue([null, mockRawRequest, jest.fn()]);

    const { result, rerender } = renderHook(() => useExpoCameraPermission());
    const first = result.current.requestPermission;

    rerender({});

    expect(result.current.requestPermission).toBe(first);
  });
});
