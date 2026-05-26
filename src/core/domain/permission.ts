/**
 * Minimal camera permission state consumed by the UI layer.
 *
 * The four possible values map directly to the four UI states rendered by
 * `PermissionGate`:
 *
 * - `null` — status not yet determined (loading).
 * - `{ granted: true }` — the user has granted camera access.
 * - `{ granted: false, canAskAgain: true }` — denied; OS will show the prompt again.
 * - `{ granted: false, canAskAgain: false }` — blocked; user must open Settings.
 *
 * By keeping this type in the domain layer the UI never depends on
 * library-specific types such as `expo-camera`'s `PermissionResponse`.
 */
export type PermissionState = {
  /** Whether camera access has been granted by the user. */
  granted: boolean;
  /** Whether the OS will show the system permission prompt if requested. */
  canAskAgain: boolean;
} | null;
