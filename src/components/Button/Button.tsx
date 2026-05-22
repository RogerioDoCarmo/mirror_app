import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

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
