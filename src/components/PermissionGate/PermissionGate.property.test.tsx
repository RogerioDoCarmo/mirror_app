import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { LocaleProvider } from '@/application/providers/LocaleProvider';
import type { TranslationKey } from '@/core/domain/translations';
import { en } from '@/i18n/translations/en';
import { PermissionGate } from './PermissionGate';

jest.mock('@/adapters/expo-localization/ExpoLocalizationAdapter', () => ({
  useExpoLocalization: jest.fn(),
}));

const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

const enPort = {
  locale: 'en' as const,
  t: (key: TranslationKey) => en[key],
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(LocaleProvider, null, children);

const onRequest = jest.fn();
const onOpenSettings = jest.fn();

const TestChild = () => <View testID="pg-child" />;

describe('PermissionGate — property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoLocalization.mockReturnValue(enPort);
  });

  it('always shows loading indicator (never children) when permission is null', () => {
    fc.assert(
      fc.property(fc.boolean(), (_) => {
        const { unmount } = render(
          <PermissionGate permission={null} onRequest={onRequest} onOpenSettings={onOpenSettings}>
            <TestChild />
          </PermissionGate>,
          { wrapper },
        );

        expect(screen.getByTestId('permission-loading')).toBeTruthy();
        expect(screen.queryByTestId('pg-child')).toBeNull();

        unmount();
      }),
    );
  });

  it('always renders children (never loading) when permission.granted=true, for any canAskAgain', () => {
    fc.assert(
      fc.property(fc.boolean(), (canAskAgain) => {
        const { unmount } = render(
          <PermissionGate
            permission={{ granted: true, canAskAgain }}
            onRequest={onRequest}
            onOpenSettings={onOpenSettings}
          >
            <TestChild />
          </PermissionGate>,
          { wrapper },
        );

        expect(screen.getByTestId('pg-child')).toBeTruthy();
        expect(screen.queryByTestId('permission-loading')).toBeNull();

        unmount();
      }),
    );
  });

  it('never renders children when permission.granted=false, for any canAskAgain', () => {
    fc.assert(
      fc.property(fc.boolean(), (canAskAgain) => {
        const { unmount } = render(
          <PermissionGate
            permission={{ granted: false, canAskAgain }}
            onRequest={onRequest}
            onOpenSettings={onOpenSettings}
          >
            <TestChild />
          </PermissionGate>,
          { wrapper },
        );

        expect(screen.queryByTestId('pg-child')).toBeNull();

        unmount();
      }),
    );
  });

  it('always shows grant button (not settings) when granted=false and canAskAgain=true', () => {
    fc.assert(
      fc.property(fc.constant(true), (canAskAgain) => {
        const { unmount } = render(
          <PermissionGate
            permission={{ granted: false, canAskAgain }}
            onRequest={onRequest}
            onOpenSettings={onOpenSettings}
          >
            <TestChild />
          </PermissionGate>,
          { wrapper },
        );

        expect(screen.getByText(en['permission.grantButton'])).toBeTruthy();
        expect(screen.queryByText(en['permission.openSettings'])).toBeNull();
        expect(screen.queryByText(en['permission.openSettingsButton'])).toBeNull();

        unmount();
      }),
    );
  });

  it('always shows settings message (not grant button) when granted=false and canAskAgain=false', () => {
    fc.assert(
      fc.property(fc.constant(false), (canAskAgain) => {
        const { unmount } = render(
          <PermissionGate
            permission={{ granted: false, canAskAgain }}
            onRequest={onRequest}
            onOpenSettings={onOpenSettings}
          >
            <TestChild />
          </PermissionGate>,
          { wrapper },
        );

        expect(screen.getByText(en['permission.openSettings'])).toBeTruthy();
        expect(screen.getByText(en['permission.openSettingsButton'])).toBeTruthy();
        expect(screen.queryByText(en['permission.grantButton'])).toBeNull();

        unmount();
      }),
    );
  });
});
