import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useCamera } from '@/hooks/useCamera';
import { PermissionGate } from '@/components/PermissionGate';

/**
 * Root screen of Miroji.
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
      onOpenSettings={() => {
        void Linking.openSettings();
      }}
    >
      {/*
       * collapsable={false} prevents Fabric from removing this layout-only View
       * from the native hierarchy.  Without it, testID is invisible to Maestro's
       * UIAutomator2 / XCTest drivers on New Architecture builds.
       *
       * accessibilityLabel duplicates testID so Maestro can match by content-desc
       * (Android) / accessibilityLabel (iOS) as a fallback when resource-id is not
       * set by the Fabric renderer.  Note: accessibilityLabel is NOT paired with
       * accessible={true} — that would group children and hide camera-view from
       * the accessibility tree.
       */}
      <View
        style={styles.container}
        testID="mirror-container"
        accessibilityLabel="mirror-container"
        collapsable={false}
      >
        {/*
         * accessible={true} is required in addition to accessibilityLabel so
         * that React Native Fabric sets importantForAccessibility="yes" on
         * Android and isAccessibilityElement=true on iOS.  Without it, Fabric
         * does not reliably expose the contentDescription / accessibilityLabel
         * to UIAutomator2 / XCTest, so Maestro's text: selector can not find
         * this element.  CameraView has no interactive React children, so
         * grouping it as a single accessible unit is safe.
         */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          mirror
          onCameraReady={onCameraReady}
          testID="camera-view"
          accessibilityLabel="camera-view"
          accessible={true}
        />
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
});
