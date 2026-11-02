/**
 * Which physical camera feeds the preview.
 *
 * Mirrors the values accepted by the platform camera view's `facing` prop so
 * the application can reason about the choice without importing `expo-camera`.
 */
export type CameraFacing = 'front' | 'back';
