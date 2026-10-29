import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

/** Props accepted by the {@link FloatingIconButton} component. */
type Props = Readonly<{
  /** Single-glyph icon drawn inside the button. */
  icon: string;
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

/**
 * Round icon button that floats over the camera preview.
 *
 * A translucent black disc with a white glyph and a thin light ring stays
 * legible over any camera frame. The glyph is purely decorative: the button's
 * accessible name comes from `label`, which also lets Maestro and screen
 * readers find it. Positioning is left to the parent so the button stays
 * reusable; {@link CameraFlipButton} and {@link MirrorToggleButton} build on it.
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
      <Text style={styles.icon} importantForAccessibility="no" accessibilityElementsHidden>
        {icon}
      </Text>
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
  icon: {
    color: '#fff',
    fontSize: 26,
    lineHeight: 30,
  },
});
