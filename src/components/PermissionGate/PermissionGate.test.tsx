import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PermissionGate } from './PermissionGate';

const CHILD_TEXT = 'Camera Content';
const Child = () => <Text>{CHILD_TEXT}</Text>;

describe('PermissionGate', () => {
  const mockOnRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when permission is null (loading)', () => {
    it('shows a loading indicator', () => {
      render(
        <PermissionGate permission={null} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByTestId('permission-loading')).toBeTruthy();
    });

    it('does not render children', () => {
      render(
        <PermissionGate permission={null} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.queryByText(CHILD_TEXT)).toBeNull();
    });
  });

  describe('when permission is denied and can ask again', () => {
    const deniedPermission = { granted: false, canAskAgain: true };

    it('shows the permission rationale message', () => {
      render(
        <PermissionGate permission={deniedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByText('Camera access is required to use MirrorApp.')).toBeTruthy();
    });

    it('shows the grant permission button', () => {
      render(
        <PermissionGate permission={deniedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByText('Grant Permission')).toBeTruthy();
    });

    it('calls onRequest when the grant button is pressed', () => {
      render(
        <PermissionGate permission={deniedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      fireEvent.press(screen.getByText('Grant Permission'));
      expect(mockOnRequest).toHaveBeenCalledTimes(1);
    });

    it('does not render children', () => {
      render(
        <PermissionGate permission={deniedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.queryByText(CHILD_TEXT)).toBeNull();
    });
  });

  describe('when permission is permanently denied (canAskAgain false)', () => {
    const blockedPermission = { granted: false, canAskAgain: false };

    it('shows the rationale message', () => {
      render(
        <PermissionGate permission={blockedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByText('Camera access is required to use MirrorApp.')).toBeTruthy();
    });

    it('does not show the grant button', () => {
      render(
        <PermissionGate permission={blockedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.queryByText('Grant Permission')).toBeNull();
    });

    it('shows a settings guidance message', () => {
      render(
        <PermissionGate permission={blockedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByText('Please enable camera access in your device settings.')).toBeTruthy();
    });
  });

  describe('when permission is granted', () => {
    const grantedPermission = { granted: true, canAskAgain: true };

    it('renders children', () => {
      render(
        <PermissionGate permission={grantedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
    });

    it('does not show the loading indicator', () => {
      render(
        <PermissionGate permission={grantedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.queryByTestId('permission-loading')).toBeNull();
    });

    it('does not show the rationale message', () => {
      render(
        <PermissionGate permission={grantedPermission} onRequest={mockOnRequest}>
          <Child />
        </PermissionGate>,
      );
      expect(screen.queryByText('Camera access is required to use MirrorApp.')).toBeNull();
    });
  });
});
