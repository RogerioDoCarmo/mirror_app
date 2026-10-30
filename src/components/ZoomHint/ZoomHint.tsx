import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Props accepted by the {@link ZoomHint} component. */
type Props = Readonly<{
  /** Localised sentence explaining the gesture, for example "Pinch to zoom". */
  label: string;
}>;

/**
 * Brief overlay that tells new users the preview can be zoomed with a pinch.
 *
 * A translucent pill with an expand icon and the label, centred over the
 * preview. It never takes touches (`pointerEvents="none"`), so a pinch started
 * on top of it reaches the camera underneath. It is a polite live region so
 * screen readers announce it when it appears, without interrupting.
 */
export function ZoomHint({ label }: Props) {
  return (
    <View
      testID="zoom-hint"
      style={styles.overlay}
      // Keeps this layout-only View in the native hierarchy so E2E drivers can find its testID.
      collapsable={false}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <View testID="zoom-hint-pill" style={styles.pill}>
        <Ionicons
          name="expand-outline"
          size={24}
          color="#fff"
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
