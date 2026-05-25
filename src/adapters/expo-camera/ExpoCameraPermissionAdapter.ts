import { useCallback, useEffect, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { ICameraPermissionPort } from '@/core/ports/CameraPermissionPort';
import type { PermissionState } from '@/core/domain/permission';

/**
 * How long (ms) to wait for the native camera permission module to respond
 * before assuming the permission is undetermined.
 *
 * On real devices `getCameraPermissionsAsync` resolves in well under a second.
 * On headless CI emulators the camera TurboModule can silently reject (the
 * rejected promise goes unhandled inside `createPermissionHook`, so `setStatus`
 * is never called and `rawPermission` stays `null` indefinitely).  The timer
 * ensures the UI always exits the loading state, even in that degenerate case.
 */
const NATIVE_MODULE_TIMEOUT_MS = 15_000;

/**
 * React hook adapter that implements {@link ICameraPermissionPort} using
 * `expo-camera`'s `useCameraPermissions` under the hood.
 *
 * This is the **only** file in the application that imports from `expo-camera`
 * for permission concerns, keeping every other module library-agnostic and
 * easy to migrate if the underlying SDK changes.
 *
 * ### Timeout safety-net
 * `createPermissionHook` (expo-modules-core) has no try-catch around the
 * initial `getCameraPermissionsAsync()` call.  If the camera TurboModule
 * fails to initialise — which happens on headless CI emulators without
 * virtual camera hardware — the rejected promise is swallowed and the hook
 * stays at `null` forever.  A {@link NATIVE_MODULE_TIMEOUT_MS}-second timer
 * detects this and falls back to `{ granted: false, canAskAgain: true }` so
 * the app always renders the permission-rationale screen rather than an
 * infinite loading spinner.
 */
export function useExpoCameraPermission(): ICameraPermissionPort {
  const [rawPermission, rawRequest] = useCameraPermissions();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Native module has already responded — nothing to do.  The timer (if it
    // was started) will be cancelled by the effect cleanup below.
    if (rawPermission !== null) return;

    // Start the safety-net timer while rawPermission is still null.
    // The timer ID is captured in the closure so the cleanup can cancel it.
    const id = setTimeout(() => {
      setTimedOut(true);
    }, NATIVE_MODULE_TIMEOUT_MS);

    return () => {
      clearTimeout(id);
    };
  }, [rawPermission]);

  const permission: PermissionState = rawPermission
    ? { granted: rawPermission.granted, canAskAgain: rawPermission.canAskAgain }
    : timedOut
      ? { granted: false, canAskAgain: true } // Native module timed out — assume undetermined
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
