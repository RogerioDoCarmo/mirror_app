import { useCallback, useRef, useState } from 'react';
import type { CameraView } from 'expo-camera';
import type { PermissionState } from '@/core/domain/permission';
import type { ICameraPermissionPort } from '@/core/ports/CameraPermissionPort';
import { useCameraPermission } from '@/application/providers/CameraProvider';

/** Shape returned by {@link useCamera}. */
export type UseCameraReturn = {
  /** Current camera permission state; `null` while loading. */
  permission: PermissionState;
  /** Triggers the OS permission prompt and resolves with the updated state. */
  requestPermission: ICameraPermissionPort['requestPermission'];
  /**
   * Ref attached to the `<CameraView>` element.
   *
   * Note: `CameraView` is imported as a type only — the adapter boundary
   * covers the permission lifecycle; the view component itself is a UI
   * primitive and is wired directly here.
   */
  cameraRef: React.RefObject<CameraView | null>;
  /** `true` once the native camera has signalled it is ready to stream frames. */
  isReady: boolean;
  /** Callback to pass to `<CameraView onCameraReady>`. Sets `isReady` to `true`. */
  onCameraReady: () => void;
};

/**
 * Encapsulates the camera permission lifecycle and the camera readiness state.
 *
 * Obtains permission state from the nearest {@link CameraProvider} via
 * {@link useCameraPermission}, keeping the hook decoupled from `expo-camera`.
 * Also manages a stable `cameraRef` and an `isReady` flag that turns `true`
 * once the native camera signals it has finished initialising.
 */
export function useCamera(): UseCameraReturn {
  const { permission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<CameraView | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Stryker disable ArrayDeclaration -- equivalent mutant: a static string literal dep never changes, so [] and ["value"] behave identically
  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);
  // Stryker restore ArrayDeclaration

  return { permission, requestPermission, cameraRef, isReady, onCameraReady };
}
