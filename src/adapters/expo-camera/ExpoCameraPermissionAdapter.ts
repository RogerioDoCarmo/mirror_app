import { useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { ICameraPermissionPort } from '@/core/ports/CameraPermissionPort';
import type { PermissionState } from '@/core/domain/permission';

/**
 * React hook adapter that implements {@link ICameraPermissionPort} using
 * `expo-camera`'s `useCameraPermissions` under the hood.
 *
 * This is the **only** file in the application that imports from `expo-camera`
 * for permission concerns, keeping every other module library-agnostic and
 * easy to migrate if the underlying SDK changes.
 */
export function useExpoCameraPermission(): ICameraPermissionPort {
  const [rawPermission, rawRequest] = useCameraPermissions();

  const permission: PermissionState = rawPermission
    ? { granted: rawPermission.granted, canAskAgain: rawPermission.canAskAgain }
    : null;

  // Stabilise the reference across re-renders so consumers that compare by
  // identity (e.g. React.memo, useCallback dependency arrays) do not re-run
  // unnecessarily.  rawRequest itself is stable across renders per the
  // expo-camera contract, so the dependency array below is safe.
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    const result = await rawRequest();
    return { granted: result.granted, canAskAgain: result.canAskAgain };
  }, [rawRequest]);

  return { permission, requestPermission };
}
