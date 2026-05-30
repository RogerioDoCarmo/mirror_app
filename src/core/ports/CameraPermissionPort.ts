import type { PermissionState } from '@/core/domain/permission';

/**
 * Primary port for the camera-permission subsystem.
 *
 * The application layer depends on this interface; adapters (e.g.
 * `useExpoCameraPermission`) implement it. Swapping the underlying
 * library only requires writing a new adapter — the rest of the app
 * is unaffected.
 */
export interface ICameraPermissionPort {
  /** Current camera permission state; `null` while loading. */
  permission: PermissionState;
  /**
   * Triggers the OS permission prompt and resolves with the updated state.
   *
   * Resolves to `null` if the underlying adapter cannot determine the
   * resulting state (implementation-specific edge case).
   */
  requestPermission: () => Promise<PermissionState>;
}
