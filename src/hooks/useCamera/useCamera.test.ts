import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import type { PermissionState } from '@/core/domain/permission';
import { useCamera } from './useCamera';

// Isolate the hook from expo-camera by mocking the adapter.  Any test that
// needs a specific permission state sets it up via mockUseExpoCameraPermission.
jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);

const makePermission = (
  overrides: Partial<NonNullable<PermissionState>> = {},
): PermissionState => ({
  granted: false,
  canAskAgain: true,
  ...overrides,
});

// Wrap the hook under test inside CameraProvider so useCameraPermission()
// resolves from context (the adapter module is mocked above).
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CameraProvider, null, children);

describe('useCamera', () => {
  const mockRequestPermission = jest.fn().mockResolvedValue(makePermission({ granted: true }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null permission while loading', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.permission).toBeNull();
  });

  it('returns permission when granted', () => {
    const granted = makePermission({ granted: true });
    mockUseExpoCameraPermission.mockReturnValue({
      permission: granted,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.permission?.granted).toBe(true);
  });

  it('returns permission when denied', () => {
    const denied = makePermission({ granted: false, canAskAgain: true });
    mockUseExpoCameraPermission.mockReturnValue({
      permission: denied,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.permission?.granted).toBe(false);
    expect(result.current.permission?.canAskAgain).toBe(true);
  });

  it('exposes the requestPermission function from the port', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.requestPermission).toBe(mockRequestPermission);
  });

  it('starts with isReady as false', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.isReady).toBe(false);
  });

  it('sets isReady to true after onCameraReady is called', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    act(() => {
      result.current.onCameraReady();
    });

    expect(result.current.isReady).toBe(true);
  });

  it('provides a stable cameraRef object', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result } = renderHook(() => useCamera(), { wrapper });

    expect(result.current.cameraRef).toBeDefined();
    expect(result.current.cameraRef.current).toBeNull();
  });

  it('returns the same onCameraReady reference across re-renders', () => {
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: mockRequestPermission,
    });

    const { result, rerender } = renderHook(() => useCamera(), { wrapper });
    const firstRef = result.current.onCameraReady;

    rerender({});

    expect(result.current.onCameraReady).toBe(firstRef);
  });
});
