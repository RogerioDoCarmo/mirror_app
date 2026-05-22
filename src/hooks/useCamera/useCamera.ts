import { useCallback, useRef, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { CameraView, PermissionResponse } from 'expo-camera';

/** Shape returned by {@link useCamera}. */
export type UseCameraReturn = {
  /** Current camera permission state; `null` while loading. */
  permission: PermissionResponse | null;
  /** Triggers the OS permission prompt and resolves with the updated response. */
  requestPermission: () => Promise<PermissionResponse>;
  /** Ref attached to the `<CameraView>` element. */
  cameraRef: React.RefObject<CameraView | null>;
  /** `true` once the native camera has signalled it is ready to stream frames. */
  isReady: boolean;
  /** Callback to pass to `<CameraView onCameraReady>`. Sets `isReady` to `true`. */
  onCameraReady: () => void;
};

/**
 * Encapsulates the camera permission lifecycle and the camera readiness state.
 *
 * Wraps `expo-camera`'s `useCameraPermissions` and exposes a stable
 * `cameraRef` plus an `isReady` flag that turns `true` once the native
 * camera signals it has finished initialising.
 */
export function useCamera(): UseCameraReturn {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Stryker disable ArrayDeclaration -- equivalent mutant: a static string literal dep never changes, so [] and ["value"] behave identically
  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);
  // Stryker restore ArrayDeclaration

  return { permission, requestPermission, cameraRef, isReady, onCameraReady };
}
