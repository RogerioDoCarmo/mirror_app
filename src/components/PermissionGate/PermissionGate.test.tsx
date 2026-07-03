import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { LocaleProvider } from '@/application/providers/LocaleProvider';
import type { TranslationKey } from '@/core/domain/translations';
import { en } from '@/i18n/translations/en';
import { PermissionGate } from './PermissionGate';

jest.mock('@/adapters/expo-localization/ExpoLocalizationAdapter', () => ({
  useExpoLocalization: jest.fn(),
}));

const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

// Wire up a real t() backed by the English translation map so assertions on
// actual user-visible strings remain meaningful and don't require duplication.
const enPort = {
  locale: 'en' as const,
  t: (key: TranslationKey) => en[key],
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(LocaleProvider, null, children);

const CHILD_TEXT = 'Camera Content';
const Child = () => <Text>{CHILD_TEXT}</Text>;

describe('PermissionGate', () => {
  const mockOnRequest = jest.fn();
  const mockOnOpenSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoLocalization.mockReturnValue(enPort);
  });

  describe('when permission is null (loading)', () => {
    it('shows a loading indicator', () => {
      render(
        <PermissionGate
          permission={null}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByTestId('permission-loading')).toBeTruthy();
    });

    it('does not render children', () => {
      render(
        <PermissionGate
          permission={null}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByText(CHILD_TEXT)).toBeNull();
    });
  });

  describe('when permission is denied and can ask again', () => {
    const deniedPermission = { granted: false, canAskAgain: true };

    it('shows the permission rationale message', () => {
      render(
        <PermissionGate
          permission={deniedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(en['permission.cameraRequired'])).toBeTruthy();
    });

    it('shows the grant permission button', () => {
      render(
        <PermissionGate
          permission={deniedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(en['permission.grantButton'])).toBeTruthy();
    });

    it('calls onRequest when the grant button is pressed', () => {
      render(
        <PermissionGate
          permission={deniedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      fireEvent.press(screen.getByText(en['permission.grantButton']));
      expect(mockOnRequest).toHaveBeenCalledTimes(1);
    });

    it('does not render children', () => {
      render(
        <PermissionGate
          permission={deniedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByText(CHILD_TEXT)).toBeNull();
    });

    it('does not show the open settings button', () => {
      render(
        <PermissionGate
          permission={deniedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByText(en['permission.openSettingsButton'])).toBeNull();
    });
  });

  describe('when permission is permanently denied (canAskAgain false)', () => {
    const blockedPermission = { granted: false, canAskAgain: false };

    it('shows the rationale message', () => {
      render(
        <PermissionGate
          permission={blockedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(en['permission.cameraRequired'])).toBeTruthy();
    });

    it('does not show the grant button', () => {
      render(
        <PermissionGate
          permission={blockedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByText(en['permission.grantButton'])).toBeNull();
    });

    it('shows a settings guidance message', () => {
      render(
        <PermissionGate
          permission={blockedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(en['permission.openSettings'])).toBeTruthy();
    });

    it('shows the open settings button', () => {
      render(
        <PermissionGate
          permission={blockedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(en['permission.openSettingsButton'])).toBeTruthy();
    });

    it('calls onOpenSettings when the open settings button is pressed', () => {
      render(
        <PermissionGate
          permission={blockedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      fireEvent.press(screen.getByText(en['permission.openSettingsButton']));
      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('when permission is granted', () => {
    const grantedPermission = { granted: true, canAskAgain: true };

    it('renders children', () => {
      render(
        <PermissionGate
          permission={grantedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
    });

    it('does not show the loading indicator', () => {
      render(
        <PermissionGate
          permission={grantedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByTestId('permission-loading')).toBeNull();
    });

    it('does not show the rationale message', () => {
      render(
        <PermissionGate
          permission={grantedPermission}
          onRequest={mockOnRequest}
          onOpenSettings={mockOnOpenSettings}
        >
          <Child />
        </PermissionGate>,
        { wrapper },
      );
      expect(screen.queryByText(en['permission.cameraRequired'])).toBeNull();
    });
  });
});
