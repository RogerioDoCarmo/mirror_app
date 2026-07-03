import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { LocaleProvider } from '@/application/providers/LocaleProvider';
import type { TranslationKey } from '@/core/domain/translations';
import { en } from '@/i18n/translations/en';
import { MirrorScreen } from './MirrorScreen';

jest.mock('@/hooks/useCamera', () => ({
  useCamera: jest.fn(),
}));

jest.mock('@/adapters/expo-localization/ExpoLocalizationAdapter', () => ({
  useExpoLocalization: jest.fn(),
}));

jest.mock('expo-camera', () => {
  // `require` is allowed in jest.mock factories; variables must be mock-prefixed
  // to satisfy Babel's jest-hoist plugin when they reference out-of-scope imports.
  const mockReact = require('react') as typeof import('react');
  const { View } = require('react-native') as typeof import('react-native');
  const MockCameraView = ({ testID }: { testID?: string }) =>
    mockReact.createElement(View, { testID: testID ?? 'camera-view' });
  return { CameraView: MockCameraView };
});

const { useCamera } = require('@/hooks/useCamera') as { useCamera: jest.Mock };
const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

const enPort = {
  locale: 'en' as const,
  t: (key: TranslationKey) => en[key],
};

const mockCameraRef = { current: null };
const mockOnCameraReady = jest.fn();
const mockRequestPermission = jest.fn();
const mockOpenSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();

const baseHookReturn = {
  cameraRef: mockCameraRef,
  isReady: false,
  onCameraReady: mockOnCameraReady,
  requestPermission: mockRequestPermission,
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(LocaleProvider, null, children);

describe('MirrorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoLocalization.mockReturnValue(enPort);
  });

  it('shows a loading indicator while camera permissions are being determined', () => {
    useCamera.mockReturnValue({ ...baseHookReturn, permission: null });

    render(<MirrorScreen />, { wrapper });

    expect(screen.getByTestId('permission-loading')).toBeTruthy();
  });

  it('shows the permission rationale when access is denied', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: false, canAskAgain: true },
    });

    render(<MirrorScreen />, { wrapper });

    expect(screen.getByText(en['permission.cameraRequired'])).toBeTruthy();
  });

  it('calls requestPermission when the grant button is pressed', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: false, canAskAgain: true },
    });

    render(<MirrorScreen />, { wrapper });
    fireEvent.press(screen.getByText(en['permission.grantButton']));

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('renders the camera view when permission is granted', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: true, canAskAgain: true },
    });

    render(<MirrorScreen />, { wrapper });

    expect(screen.getByTestId('mirror-container')).toBeTruthy();
    expect(screen.getByTestId('camera-view')).toBeTruthy();
  });

  it('does not show the camera when permission is denied', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: false, canAskAgain: true },
    });

    render(<MirrorScreen />, { wrapper });

    expect(screen.queryByTestId('camera-view')).toBeNull();
  });

  it('shows the open settings button when permission is permanently denied', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: false, canAskAgain: false },
    });

    render(<MirrorScreen />, { wrapper });

    expect(screen.getByText(en['permission.openSettingsButton'])).toBeTruthy();
  });

  it('calls Linking.openSettings when the open settings button is pressed', () => {
    useCamera.mockReturnValue({
      ...baseHookReturn,
      permission: { granted: false, canAskAgain: false },
    });

    render(<MirrorScreen />, { wrapper });
    fireEvent.press(screen.getByText(en['permission.openSettingsButton']));

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
});
