import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Name of an Ionicons glyph. */
type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Props accepted by the {@link Hint} component. */
type Props = Readonly<{
  /** Localised sentence explaining the feature, for example "Pinch to zoom". */
  label: string;
  /** Ionicons glyph drawn next to the label; use the one the feature itself shows. */
  icon: IconName;
  /** Test identifier of the overlay. The pill inside it gets `${testID}-pill`. */
  testID: string;
}>;

/**
 * Brief overlay that tells new users about a feature they might not find alone.
 *
 * A translucent pill with an icon and the label, centred over the preview. It
 * never takes touches (`pointerEvents="none"`), so a gesture started on top of
 * it reaches the camera underneath. It is a polite live region so screen
 * readers announce it when it appears, without interrupting. Used for the
 * pinch-to-zoom tip and the flip tip.
 */
export function Hint({ label, icon, testID }: Props) {
  return (
    <View
      testID={testID}
      style={styles.overlay}
      // Keeps this layout-only View in the native hierarchy so E2E drivers can find its testID.
      collapsable={false}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <View testID={`${testID}-pill`} style={styles.pill}>
        <Ionicons
          name={icon}
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
