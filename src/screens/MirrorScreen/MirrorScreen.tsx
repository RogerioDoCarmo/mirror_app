import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale } from '@/application/providers/LocaleProvider';
import { useCamera } from '@/hooks/useCamera';
import { useZoomHint } from '@/hooks/useZoomHint';
import { CameraFlipButton } from '@/components/CameraFlipButton';
import { MirrorToggleButton } from '@/components/MirrorToggleButton';
import { PermissionGate } from '@/components/PermissionGate';
import { TorchButton } from '@/components/TorchButton';
import { ZoomHint } from '@/components/ZoomHint';

/** Gap kept between the control buttons and the left screen edge, on top of any safe-area inset. */
const CONTROLS_SIDE_MARGIN = 16;

/**
 * Gap kept between the control buttons and the bottom screen edge, on top of
 * any safe-area inset. Larger than the side gap so the lowest button sits well
 * clear of the gesture bar and the rounded corners, where a thumb reaches it
 * without brushing the system navigation.
 */
const CONTROLS_BOTTOM_MARGIN = 48;

/**
 * Root screen of Miroji.
 *
 * Starts on the front-facing camera in mirror mode so the user sees a real-time
 * reflection of themselves. A two-finger pinch zooms the preview, announced to
 * new users by a brief hint, and floating buttons in the bottom-left corner
 * switch between the front and back camera, between the mirror view and the
 * view other people have of the user, and (on the back camera) turn the
 * flashlight on and off.
 * Camera permission is handled by {@link PermissionGate}: the camera view is
 * only mounted once access has been granted.
 */
export function MirrorScreen() {
  const {
    permission,
    requestPermission,
    cameraRef,
    onCameraReady,
    facing,
    toggleFacing,
    showMirrored,
    toggleMirrored,
    nativeMirror,
    torchOn,
    canUseTorch,
    toggleTorch,
    previewFlipped,
    zoom,
    pinchHandlers,
  } = useCamera();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const zoomHintVisible = useZoomHint(permission?.granted === true, zoom);

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
         * Responder wrapper for the pinch-to-zoom gesture.  collapsable={false}
         * keeps it in the native hierarchy so touches reach it on Fabric.
         * accessible={true} on the CameraView below is required in addition to
         * accessibilityLabel so that React Native Fabric sets
         * importantForAccessibility="yes" on Android and
         * isAccessibilityElement=true on iOS.  Without it, Fabric does not
         * reliably expose the contentDescription / accessibilityLabel to
         * UIAutomator2 / XCTest, so Maestro's text: selector can not find this
         * element.  CameraView has no interactive React children, so grouping
         * it as a single accessible unit is safe.
         */}
        <View
          style={[styles.camera, previewFlipped && styles.flipped]}
          testID="pinch-zoom-area"
          collapsable={false}
          {...pinchHandlers}
        >
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            zoom={zoom}
            mirror={nativeMirror}
            enableTorch={torchOn}
            onCameraReady={onCameraReady}
            testID="camera-view"
            accessibilityLabel="camera-view"
            accessible={true}
          />
        </View>
        {/* One-time overlay for new users; it ignores touches so a pinch passes through. */}
        {zoomHintVisible && <ZoomHint label={t('camera.zoomHint')} />}
        {/*
         * Rendered after the camera so the controls float above the preview.
         * The inset is added to the margin so they clear the home indicator and
         * rounded corners on edge-to-edge screens.  They sit bottom-left, where
         * a thumb rests when holding the phone: the camera switch lowest, the
         * mirror toggle above it and, on the back camera only, the flashlight
         * at the top.
         */}
        <View
          testID="camera-controls"
          style={[
            styles.controls,
            {
              left: CONTROLS_SIDE_MARGIN + insets.left,
              bottom: CONTROLS_BOTTOM_MARGIN + insets.bottom,
            },
          ]}
        >
          {canUseTorch && (
            <TorchButton
              label={t(torchOn ? 'camera.turnTorchOff' : 'camera.turnTorchOn')}
              on={torchOn}
              onPress={toggleTorch}
            />
          )}
          <MirrorToggleButton
            label={t(showMirrored ? 'camera.showAsOthersSeeYou' : 'camera.showMirrorView')}
            selected={!showMirrored}
            onPress={toggleMirrored}
          />
          <CameraFlipButton label={t('camera.switchCamera')} onPress={toggleFacing} />
        </View>
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  // Flips the preview horizontally; pinch distances are unaffected by the mirror image.
  flipped: { transform: [{ scaleX: -1 }] },
  controls: { position: 'absolute', gap: 12 },
});
