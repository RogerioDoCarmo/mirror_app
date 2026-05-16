import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useCamera } from '@/hooks/useCamera';
import { PermissionGate } from '@/components/PermissionGate';

export function MirrorScreen() {
  const { permission, requestPermission, cameraRef, onCameraReady } = useCamera();

  return (
    <PermissionGate
      permission={permission}
      onRequest={() => {
        void requestPermission();
      }}
    >
      <View style={styles.container} testID="mirror-container">
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          mirror
          onCameraReady={onCameraReady}
          testID="camera-view"
        />
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
});
