/** Camera zoom when nothing is magnified. */
export const MIN_ZOOM = 0;

/** Camera zoom at the device's maximum magnification. */
export const MAX_ZOOM = 1;

/**
 * Zoom added per unit of pinch scale.
 *
 * A pinch that doubles the distance between the fingers (scale 2) adds half of
 * the zoom range, so the full range is covered by roughly tripling that distance.
 */
export const PINCH_SENSITIVITY = 0.5;

/** Restricts `value` to the `[MIN_ZOOM, MAX_ZOOM]` range accepted by the camera view. */
export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

/**
 * Converts a pinch gesture into a camera zoom level.
 *
 * `baseZoom` is the zoom in effect when the gesture began and `scale` is the
 * gesture's cumulative scale factor (1 = fingers have not moved). Scale 1 is
 * therefore the identity, spreading the fingers zooms in, pinching them
 * together zooms out, and the result is always clamped to the valid range.
 */
export function zoomFromPinchScale(baseZoom: number, scale: number): number {
  return clampZoom(baseZoom + (scale - 1) * PINCH_SENSITIVITY);
}

/** Screen position of one finger, as reported on a touch event's `touches` list. */
export type TouchPoint = Readonly<{ pageX: number; pageY: number }>;

/** Straight-line distance between two fingers, in screen points. */
export function distanceBetween(a: TouchPoint, b: TouchPoint): number {
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

/**
 * Scale factor of a pinch: how far the fingers are now relative to where they
 * started. A zero `startDistance` (both fingers on the same point) carries no
 * information, so it yields 1 (no change) rather than dividing by zero.
 */
export function pinchScale(startDistance: number, distance: number): number {
  return startDistance > 0 ? distance / startDistance : 1;
}
