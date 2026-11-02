import { useCallback, useRef, useState } from 'react';
import type { CameraView } from 'expo-camera';
import type { CameraFacing } from '@/core/domain/camera';
import type { PermissionState } from '@/core/domain/permission';
import type { ICameraPermissionPort } from '@/core/ports/CameraPermissionPort';
import { useCameraPermission } from '@/application/providers/CameraProvider';
import { usePinchZoom } from '@/hooks/usePinchZoom';
import type { UsePinchZoomReturn } from '@/hooks/usePinchZoom';
import { isNaturallyMirrored, needsExtraFlip } from './mirror';

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
  /** Camera currently feeding the preview. Starts as `'front'` (mirror mode). */
  facing: CameraFacing;
  /** Swaps between the front and back camera, resetting the zoom and the mirror choice. */
  toggleFacing: () => void;
  /**
   * `true` while the user is looking at the mirror view, `false` for the view
   * other people have of them. Defaults to the camera's own look: mirrored on
   * the front camera, unmirrored on the back one.
   */
  showMirrored: boolean;
  /** Switches between the mirror view and the view other people see. */
  toggleMirrored: () => void;
  /** Value for `<CameraView mirror>`: the front camera is rendered mirrored, the back one is not. */
  nativeMirror: boolean;
  /** `true` while the flashlight is lit, for `<CameraView enableTorch>`. */
  torchOn: boolean;
  /** `true` when the current camera has a flashlight to offer: only the back one does. */
  canUseTorch: boolean;
  /** Turns the flashlight on or off. */
  toggleTorch: () => void;
  /**
   * `true` when the preview must be flipped horizontally on top of the camera
   * view's native `mirror` option to honour {@link UseCameraReturn.showMirrored}.
   */
  previewFlipped: boolean;
  /** Current zoom level in `[0, 1]`, for `<CameraView zoom>`. */
  zoom: UsePinchZoomReturn['zoom'];
  /** Responder props for the view that should zoom on a two-finger pinch. */
  pinchHandlers: UsePinchZoomReturn['pinchHandlers'];
};

/**
 * Encapsulates the camera permission lifecycle, readiness, facing and zoom.
 *
 * Obtains permission state from the nearest {@link CameraProvider} via
 * {@link useCameraPermission}, keeping the hook decoupled from `expo-camera`.
 * Also manages a stable `cameraRef` and an `isReady` flag that turns `true`
 * once the native camera signals it has finished initialising.
 *
 * The camera starts front-facing because Miroji is a mirror. Switching cameras
 * also resets the zoom, since a zoom level chosen for one lens means nothing
 * for the other, puts the mirror choice back to that camera's natural look and
 * turns the flashlight off, so it is never left lit behind the user's back.
 * The pinch-to-zoom state is delegated to {@link usePinchZoom}.
 */
export function useCamera(): UseCameraReturn {
  const { permission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<CameraView | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<CameraFacing>('front');
  const [showMirrored, setShowMirrored] = useState(isNaturallyMirrored('front'));
  const [torchOn, setTorchOn] = useState(false);
  const { zoom, pinchHandlers, resetZoom } = usePinchZoom();

  // Stryker disable ArrayDeclaration -- equivalent mutant: a static string literal dep never changes, so [] and ["value"] behave identically
  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const toggleFacing = useCallback(() => {
    const next: CameraFacing = facing === 'front' ? 'back' : 'front';
    setFacing(next);
    setShowMirrored(isNaturallyMirrored(next));
    setTorchOn(false);
    resetZoom();
  }, [facing, resetZoom]);

  const toggleMirrored = useCallback(() => {
    setShowMirrored((current) => !current);
  }, []);

  const toggleTorch = useCallback(() => {
    setTorchOn((current) => !current);
  }, []);
  // Stryker restore ArrayDeclaration

  return {
    permission,
    requestPermission,
    cameraRef,
    isReady,
    onCameraReady,
    facing,
    toggleFacing,
    showMirrored,
    toggleMirrored,
    nativeMirror: isNaturallyMirrored(facing),
    torchOn,
    canUseTorch: facing === 'back',
    toggleTorch,
    previewFlipped: needsExtraFlip(facing, showMirrored),
    zoom,
    pinchHandlers,
  };
}
