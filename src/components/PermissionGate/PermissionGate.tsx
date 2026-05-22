import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import type { PermissionState } from '@/core/domain/permission';

/** Props accepted by the {@link PermissionGate} component. */
type Props = {
  /**
   * Current camera permission state.
   * Pass `null` while the status is still loading to show a spinner.
   */
  permission: PermissionState;
  /** Called when the user taps "Grant Permission". */
  onRequest: () => void;
  /** Content rendered once permission is granted. */
  children: React.ReactNode;
};

/**
 * Guards its children behind the camera permission lifecycle.
 *
 * Renders one of four states based on `permission`:
 *
 * - **null** → loading spinner.
 * - **denied, canAskAgain** → rationale message + "Grant Permission" button.
 * - **denied, blocked** → rationale message + settings guidance.
 * - **granted** → renders `children`.
 */
export function PermissionGate({ permission, onRequest, children }: Props) {
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="permission-loading" size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is required to use MirrorApp.</Text>
        {permission.canAskAgain ? (
          <Button label="Grant Permission" onPress={onRequest} />
        ) : (
          <Text style={styles.settings}>Please enable camera access in your device settings.</Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  settings: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
