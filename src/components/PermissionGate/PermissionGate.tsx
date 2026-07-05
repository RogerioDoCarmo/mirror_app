import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import type { PermissionState } from '@/core/domain/permission';
import { useLocale } from '@/application/providers/LocaleProvider';

/** Props accepted by the {@link PermissionGate} component. */
type Props = Readonly<{
  /**
   * Current camera permission state.
   * Pass `null` while the status is still loading to show a spinner.
   */
  permission: PermissionState;
  /** Called when the user taps the grant-permission button. */
  onRequest: () => void;
  /** Called when the user taps the open-settings button (permission blocked). */
  onOpenSettings: () => void;
  /** Content rendered once permission is granted. */
  children: React.ReactNode;
}>;

/**
 * Guards its children behind the camera permission lifecycle.
 *
 * All visible strings are localised via {@link useLocale} so the component
 * automatically reflects the user's OS language. Renders one of four states:
 *
 * - **null** → loading spinner.
 * - **denied, canAskAgain** → rationale message + grant-permission button.
 * - **denied, blocked** → rationale message + settings guidance + open-settings button.
 * - **granted** → renders `children`.
 */
export function PermissionGate({ permission, onRequest, onOpenSettings, children }: Props) {
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
         * accessibilityLabel is a STABLE, locale-independent identifier
         * ("permission-rationale") whereas the visible text is localised via
         * t().  E2E flows must match on this label, not the translated message,
         * so the assertion does not break when the CI device runs in a non-en
         * locale.
         *
         * accessible={true} forces Fabric to set importantForAccessibility="yes"
         * (Android) / isAccessibilityElement=true (iOS) and to expose the
         * accessibilityLabel as content-desc / accessibilityLabel — the same
         * pattern that makes camera-view matchable by Maestro's text: selector.
         * A <Text> has no interactive children, so grouping it is safe.
         */}
        <Text
          testID="permission-rationale"
          accessibilityLabel="permission-rationale"
          accessible={true}
          style={styles.message}
        >
          {t('permission.cameraRequired')}
        </Text>
        {permission.canAskAgain ? (
          <Button label={t('permission.grantButton')} onPress={onRequest} />
        ) : (
          <>
            <Text
              testID="permission-settings"
              accessibilityLabel="permission-settings"
              style={styles.settings}
            >
              {t('permission.openSettings')}
            </Text>
            <Button label={t('permission.openSettingsButton')} onPress={onOpenSettings} />
          </>
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
    marginBottom: 20,
  },
});
