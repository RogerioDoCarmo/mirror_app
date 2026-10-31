import React from 'react';
import { FloatingIconButton } from '@/components/FloatingIconButton';

/** Props accepted by the {@link MirrorToggleButton} component. */
type Props = Readonly<{
  /**
   * Localised accessible name. It should describe what pressing does (for
   * example "Show as others see you"), so it changes with the current state.
   */
  label: string;
  /** `true` while the preview is flipped away from its natural look. */
  selected: boolean;
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
  /** Test identifier forwarded to the root `Pressable`. Defaults to `"mirror-toggle-button"`. */
  testID?: string;
}>;

/**
 * Round icon button that flips the preview between the mirrored view and the
 * view other people see.
 *
 * A {@link FloatingIconButton} showing left-right arrows, exposing
 * `selected` to assistive technology. Positioning is left to the parent.
 */
export function MirrorToggleButton({
  label,
  selected,
  onPress,
  testID = 'mirror-toggle-button',
}: Props) {
  return (
    <FloatingIconButton
      icon="swap-horizontal"
      label={label}
      selected={selected}
      onPress={onPress}
      testID={testID}
    />
  );
}
