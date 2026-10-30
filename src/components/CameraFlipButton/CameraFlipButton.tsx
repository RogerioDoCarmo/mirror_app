import React from 'react';
import { FloatingIconButton } from '@/components/FloatingIconButton';

/** Props accepted by the {@link CameraFlipButton} component. */
type Props = Readonly<{
  /** Localised accessible name announced by screen readers (the button shows only an icon). */
  label: string;
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
  /** Test identifier forwarded to the root `Pressable`. Defaults to `"camera-flip-button"`. */
  testID?: string;
}>;

/**
 * Round icon button that switches between the front and back camera.
 *
 * A {@link FloatingIconButton} showing a camera with a reverse arrow.
 * Positioning is left to the parent.
 */
export function CameraFlipButton({ label, onPress, testID = 'camera-flip-button' }: Props) {
  return (
    <FloatingIconButton
      icon="camera-reverse-outline"
      label={label}
      onPress={onPress}
      testID={testID}
    />
  );
}
