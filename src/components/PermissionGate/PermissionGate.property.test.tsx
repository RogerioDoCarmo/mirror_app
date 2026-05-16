import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { PermissionGate } from './PermissionGate';

const onRequest = jest.fn();

const TestChild = () => <View testID="pg-child" />;

describe('PermissionGate — property tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always shows loading indicator (never children) when permission is null', () => {
    fc.assert(
      fc.property(fc.boolean(), (_) => {
        const { unmount } = render(
          <PermissionGate permission={null} onRequest={onRequest}>
            <TestChild />
          </PermissionGate>,
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
          <PermissionGate permission={{ granted: true, canAskAgain }} onRequest={onRequest}>
            <TestChild />
          </PermissionGate>,
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
          <PermissionGate permission={{ granted: false, canAskAgain }} onRequest={onRequest}>
            <TestChild />
          </PermissionGate>,
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
          <PermissionGate permission={{ granted: false, canAskAgain }} onRequest={onRequest}>
            <TestChild />
          </PermissionGate>,
        );

        expect(screen.getByText('Grant Permission')).toBeTruthy();
        expect(
          screen.queryByText('Please enable camera access in your device settings.'),
        ).toBeNull();

        unmount();
      }),
    );
  });

  it('always shows settings message (not grant button) when granted=false and canAskAgain=false', () => {
    fc.assert(
      fc.property(fc.constant(false), (canAskAgain) => {
        const { unmount } = render(
          <PermissionGate permission={{ granted: false, canAskAgain }} onRequest={onRequest}>
            <TestChild />
          </PermissionGate>,
        );

        expect(
          screen.getByText('Please enable camera access in your device settings.'),
        ).toBeTruthy();
        expect(screen.queryByText('Grant Permission')).toBeNull();

        unmount();
      }),
    );
  });
});
