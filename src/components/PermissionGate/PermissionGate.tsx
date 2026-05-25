import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import type { PermissionState } from '@/core/domain/permission';
import { useLocale } from '@/application/providers/LocaleProvider';

/** Props accepted by the {@link PermissionGate} component. */
type Props = {
  /**
   * Current camera permission state.
   * Pass `null` while the status is still loading to show a spinner.
   */
  permission: PermissionState;
  /** Called when the user taps the grant-permission button. */
  onRequest: () => void;
  /** Content rendered once permission is granted. */
  children: React.ReactNode;
};

/**
 * Guards its children behind the camera permission lifecycle.
 *
 * All visible strings are localised via {@link useLocale} so the component
 * automatically reflects the user's OS language. Renders one of four states:
 *
 * - **null** → loading spinner.
 * - **denied, canAskAgain** → rationale message + grant-permission button.
 * - **denied, blocked** → rationale message + settings guidance.
 * - **granted** → renders `children`.
 */
export function PermissionGate({ permission, onRequest, children }: Props) {
  const { t } = useLocale();

  if (!permission) {
    return (
      <View style={styles.center} collapsable={false}>
        <ActivityIndicator
          testID="permission-loading"
          accessibilityLabel="permission-loading"
          size="large"
          color="#fff"
        />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center} collapsable={false}>
        {/*
         * accessibilityLabel duplicates testID so Maestro can locate this element
         * on Android New Architecture builds, where the Fabric renderer does not
         * always propagate testID to the UIAutomator2 resource-id field.  Maestro's
         * id: matcher falls back to content-desc (Android) / accessibilityLabel
         * (iOS), making the assertion platform-reliable without requiring
         * accessible={true} (which would hide child elements from the tree).
         */}
        <Text
          testID="permission-rationale"
          accessibilityLabel="permission-rationale"
          style={styles.message}
        >
          {t('permission.cameraRequired')}
        </Text>
        {permission.canAskAgain ? (
          <Button label={t('permission.grantButton')} onPress={onRequest} />
        ) : (
          <Text
            testID="permission-settings"
            accessibilityLabel="permission-settings"
            style={styles.settings}
          >
            {t('permission.openSettings')}
          </Text>
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
