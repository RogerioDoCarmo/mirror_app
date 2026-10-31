import React from 'react';
import { FloatingIconButton } from '@/components/FloatingIconButton';

/** Props accepted by the {@link TorchButton} component. */
type Props = Readonly<{
  /**
   * Localised accessible name. It should describe what pressing does (for
   * example "Turn flashlight on"), so it changes with the current state.
   */
  label: string;
  /** `true` while the flashlight is lit. */
  on: boolean;
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
  /** Test identifier forwarded to the root `Pressable`. Defaults to `"torch-button"`. */
  testID?: string;
}>;

/**
 * Round icon button that turns the flashlight on and off.
 *
 * A {@link FloatingIconButton} showing a flashlight that is filled while lit
 * and outlined while off, exposing `on` to assistive technology as its
 * selected state. Positioning is left to the parent.
 */
export function TorchButton({ label, on, onPress, testID = 'torch-button' }: Props) {
  return (
    <FloatingIconButton
      icon={on ? 'flashlight' : 'flashlight-outline'}
      label={label}
      selected={on}
      onPress={onPress}
      testID={testID}
    />
  );
}
