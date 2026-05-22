import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useCamera } from '@/hooks/useCamera';
import { PermissionGate } from '@/components/PermissionGate';

/**
 * Root screen of MirrorApp.
 *
 * Uses the front-facing camera in mirror mode so the user sees a real-time
 * reflection of themselves. Camera permission is handled by {@link PermissionGate}:
 * the camera view is only mounted once access has been granted.
 */
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
