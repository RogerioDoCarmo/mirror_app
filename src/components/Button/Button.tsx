import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

/** Props accepted by the {@link Button} component. */
type Props = {
  /** Text rendered inside the button. */
  label: string;
  /** Callback invoked when the button is pressed. Not called when `disabled`. */
  onPress: () => void;
  /** When `true` the button is non-interactive and rendered at reduced opacity. */
  disabled?: boolean;
  /** Test identifier forwarded to the root `Pressable`. Defaults to `"app-button"`. */
  testID?: string;
};

/**
 * Styled pressable button used throughout the app.
 *
 * Renders a white pill with dark label text. When `disabled` the press handler
 * is suppressed internally so callers never receive phantom callbacks.
 */
export function Button({ label, onPress, disabled = false, testID = 'app-button' }: Props) {
  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={[styles.button, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
