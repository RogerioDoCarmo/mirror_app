import type { CameraFacing } from '@/core/domain/camera';

/**
 * Whether the preview of `facing` looks mirrored without any extra flip.
 *
 * Only the front camera does: it is rendered with the camera view's native
 * `mirror` option, like a bathroom mirror. The back camera shows the world as
 * it is.
 */
export function isNaturallyMirrored(facing: CameraFacing): boolean {
  return facing === 'front';
}

/**
 * Whether the preview must be flipped horizontally on top of its natural look
 * so that it matches what the user asked to see.
 *
 * `showMirrored` is the user's choice: `true` for the mirror view, `false` for
 * the view other people have of them. It works for both cameras because it is
 * compared against what each camera shows on its own.
 */
export function needsExtraFlip(facing: CameraFacing, showMirrored: boolean): boolean {
  return showMirrored !== isNaturallyMirrored(facing);
}
