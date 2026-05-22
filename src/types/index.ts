import type { PermissionState } from '@/core/domain/permission';

/**
 * Re-export of the domain camera permission state for convenience.
 *
 * Prefer importing {@link PermissionState} directly from
 * `@/core/domain/permission` in new code. This alias exists only for
 * backward compatibility.
 *
 * @deprecated Use `PermissionState` from `@/core/domain/permission` instead.
 */
export type CameraPermission = PermissionState;
