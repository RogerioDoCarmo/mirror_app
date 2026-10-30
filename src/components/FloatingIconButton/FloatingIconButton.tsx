import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Name of an Ionicons glyph. */
export type FloatingIconName = React.ComponentProps<typeof Ionicons>['name'];

/** Props accepted by the {@link FloatingIconButton} component. */
type Props = Readonly<{
  /** Ionicons glyph drawn inside the button. */
  icon: FloatingIconName;
  /** Localised accessible name announced by screen readers (the button shows only an icon). */
  label: string;
  /** Callback invoked when the button is pressed. */
  onPress: () => void;
  /** Test identifier forwarded to the root `Pressable`. */
  testID: string;
  /** Exposes a toggle state to assistive technology. Omit for plain action buttons. */
  selected?: boolean;
}>;

/** Edge length of the round button; above the 44pt / 48dp minimum touch target. */
const SIZE = 48;

/** Edge length of the icon drawn inside the button, leaving a comfortable ring around it. */
const ICON_SIZE = 26;

/**
 * Round icon button that floats over the camera preview.
 *
 * A translucent black disc with a white vector icon and a thin light ring stays
 * legible over any camera frame. The icon is a vector glyph, not a text
 * character, so it is drawn the same size and dead-centre on every device and
 * font. It is purely decorative: the button's accessible name comes from
 * `label`, which also lets Maestro and screen readers find it. Positioning is
 * left to the parent so the button stays reusable; {@link CameraFlipButton},
 * {@link MirrorToggleButton} and {@link TorchButton} build on it.
 */
export function FloatingIconButton({ icon, label, onPress, testID, selected }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Ionicons
        name={icon}
        size={ICON_SIZE}
        color="#fff"
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
