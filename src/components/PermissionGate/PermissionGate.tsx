import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';

type PermissionInfo = {
  granted: boolean;
  canAskAgain: boolean;
};

type Props = {
  permission: PermissionInfo | null;
  onRequest: () => void;
  children: React.ReactNode;
};

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
