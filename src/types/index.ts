import type { PermissionResponse } from 'expo-camera';

/**
 * The resolved camera permission state returned by `useCameraPermissions`.
 * `null` while the permission status is still being determined (loading).
 */
export type CameraPermission = PermissionResponse | null;
