import React from 'react';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { LocaleProvider } from '@/application/providers/LocaleProvider';
import type { TranslationKey } from '@/core/domain/translations';
import { en } from '@/i18n/translations/en';
import { es } from '@/i18n/translations/es';
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
  // Props the screen hands to the real CameraView are forwarded to the host
  // View so tests can assert on them.
  const MockCameraView = ({
    testID,
    facing,
    zoom,
    mirror,
    accessible,
    accessibilityLabel,
  }: {
    accessible?: boolean;
    accessibilityLabel?: string;
    testID?: string;
    facing?: string;
    zoom?: number;
    mirror?: boolean;
  }) =>
    // The 'View' host component is what React Native's View renders, and unlike
    // View itself it accepts the camera-specific props asserted on below.
    mockReact.createElement('View', {
      testID: testID ?? 'camera-view',
      facing,
      zoom,
      mirror,
      accessible,
      accessibilityLabel,
    });
  return { CameraView: MockCameraView };
});

const { useCamera } = require('@/hooks/useCamera') as { useCamera: jest.Mock };
const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

const enPort = {
  locale: 'en' as const,
  t: (key: TranslationKey) => en[key],
};

const esPort = {
  locale: 'es' as const,
  t: (key: TranslationKey) => es[key],
};

const mockCameraRef = { current: null };
const mockOnCameraReady = jest.fn();
const mockRequestPermission = jest.fn();
const mockToggleFacing = jest.fn();
const mockToggleMirrored = jest.fn();
const mockOpenSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();

const mockPinchHandlers = {
  onStartShouldSetResponder: jest.fn(),
  onMoveShouldSetResponder: jest.fn(),
  onResponderGrant: jest.fn(),
  onResponderMove: jest.fn(),
  onResponderRelease: jest.fn(),
  onResponderTerminate: jest.fn(),
  onResponderTerminationRequest: jest.fn(),
};

const baseHookReturn = {
  cameraRef: mockCameraRef,
  isReady: false,
  onCameraReady: mockOnCameraReady,
  requestPermission: mockRequestPermission,
  facing: 'front' as const,
  toggleFacing: mockToggleFacing,
  showMirrored: true,
  toggleMirrored: mockToggleMirrored,
  nativeMirror: true,
  previewFlipped: false,
  zoom: 0,
  pinchHandlers: mockPinchHandlers,
};

const granted = { granted: true, canAskAgain: true };

const insets = { top: 0, left: 7, right: 0, bottom: 34 };
const frame = { x: 0, y: 0, width: 390, height: 844 };

const makeWrapper = (metrics = { frame, insets }) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      SafeAreaProvider,
      { initialMetrics: metrics },
      React.createElement(LocaleProvider, null, children),
    );
  };

const wrapper = makeWrapper();

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
    useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

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

  describe('camera preview', () => {
    it('hands facing, zoom and mirror to the camera view', () => {
      useCamera.mockReturnValue({
        ...baseHookReturn,
        permission: granted,
        facing: 'back',
        zoom: 0.4,
        nativeMirror: false,
      });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('camera-view')).toHaveProp('facing', 'back');
      expect(screen.getByTestId('camera-view')).toHaveProp('zoom', 0.4);
      expect(screen.getByTestId('camera-view')).toHaveProp('mirror', false);
    });

    it('mirrors the front camera preview', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('camera-view')).toHaveProp('facing', 'front');
      expect(screen.getByTestId('camera-view')).toHaveProp('zoom', 0);
      expect(screen.getByTestId('camera-view')).toHaveProp('mirror', true);
    });

    it('does not flip the preview in its natural look', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('pinch-zoom-area')).not.toHaveStyle({
        transform: [{ scaleX: -1 }],
      });
    });

    it('flips the preview horizontally when requested', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted, previewFlipped: true });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('pinch-zoom-area')).toHaveStyle({ transform: [{ scaleX: -1 }] });
    });

    it('fills the screen with the pinch area', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('pinch-zoom-area')).toHaveStyle({ flex: 1 });
    });

    it('wires every pinch responder handler to the area around the camera', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onStartShouldSetResponder',
        mockPinchHandlers.onStartShouldSetResponder,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onMoveShouldSetResponder',
        mockPinchHandlers.onMoveShouldSetResponder,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onResponderGrant',
        mockPinchHandlers.onResponderGrant,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onResponderMove',
        mockPinchHandlers.onResponderMove,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onResponderRelease',
        mockPinchHandlers.onResponderRelease,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onResponderTerminate',
        mockPinchHandlers.onResponderTerminate,
      );
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp(
        'onResponderTerminationRequest',
        mockPinchHandlers.onResponderTerminationRequest,
      );
    });

    it('keeps the camera inside the pinch area and the controls outside it', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('pinch-zoom-area')).toContainElement(
        screen.getByTestId('camera-view'),
      );
      expect(screen.getByTestId('pinch-zoom-area')).not.toContainElement(
        screen.getByTestId('camera-controls'),
      );
    });
  });

  describe('native hierarchy attributes for E2E drivers', () => {
    it('keeps the layout-only containers in the native hierarchy', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('mirror-container')).toHaveProp('collapsable', false);
      expect(screen.getByTestId('pinch-zoom-area')).toHaveProp('collapsable', false);
    });

    it('exposes the camera view as a single accessible element named camera-view', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('camera-view')).toHaveProp('accessible', true);
      expect(screen.getByTestId('camera-view')).toHaveProp('accessibilityLabel', 'camera-view');
    });
  });

  describe('camera switch button', () => {
    it('is shown with the localised accessible name when the camera is available', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByRole('button', { name: 'Switch camera' })).toBeTruthy();
      expect(screen.getByTestId('camera-flip-button')).toBeTruthy();
    });

    it('is translated into the active locale', () => {
      mockUseExpoLocalization.mockReturnValue(esPort);
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByRole('button', { name: 'Cambiar de cámara' })).toBeTruthy();
    });

    it('switches camera when pressed', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });
      render(<MirrorScreen />, { wrapper });

      fireEvent.press(screen.getByTestId('camera-flip-button'));

      expect(mockToggleFacing).toHaveBeenCalledTimes(1);
    });

    it('is not shown while the permission prompt is up', () => {
      useCamera.mockReturnValue({
        ...baseHookReturn,
        permission: { granted: false, canAskAgain: true },
      });

      render(<MirrorScreen />, { wrapper });

      expect(screen.queryByTestId('camera-flip-button')).toBeNull();
      expect(screen.queryByTestId('mirror-toggle-button')).toBeNull();
    });
  });

  describe('mirror toggle button', () => {
    it('offers the view other people see while the mirror view is showing', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted, showMirrored: true });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByRole('button', { name: 'Show as others see you' })).toHaveProp(
        'accessibilityState',
        { selected: false },
      );
    });

    it('offers the mirror view while the unmirrored view is showing', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted, showMirrored: false });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByRole('button', { name: 'Show mirror view' })).toHaveProp(
        'accessibilityState',
        { selected: true },
      );
    });

    it('is translated into the active locale', () => {
      mockUseExpoLocalization.mockReturnValue(esPort);
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByRole('button', { name: 'Mostrar como te ven los demás' })).toBeTruthy();
    });

    it('toggles the mirror view when pressed', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });
      render(<MirrorScreen />, { wrapper });

      fireEvent.press(screen.getByTestId('mirror-toggle-button'));

      expect(mockToggleMirrored).toHaveBeenCalledTimes(1);
      expect(mockToggleFacing).not.toHaveBeenCalled();
    });
  });

  describe('control placement', () => {
    it('sits bottom-left, 16 points from the edges plus the safe-area insets', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      // insets are left 7 and bottom 34
      expect(screen.getByTestId('camera-controls')).toHaveStyle({
        position: 'absolute',
        left: 23,
        bottom: 50,
      });
    });

    it('keeps the plain 16 point margin when the screen has no insets', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, {
        wrapper: makeWrapper({ frame, insets: { top: 0, left: 0, right: 0, bottom: 0 } }),
      });

      expect(screen.getByTestId('camera-controls')).toHaveStyle({ left: 16, bottom: 16 });
    });

    it('spaces the two buttons 12 points apart, mirror toggle above camera switch', () => {
      useCamera.mockReturnValue({ ...baseHookReturn, permission: granted });

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByTestId('camera-controls')).toHaveStyle({ gap: 12 });
      expect(screen.getAllByRole('button')[0]).toHaveProp('testID', 'mirror-toggle-button');
      expect(screen.getAllByRole('button')[1]).toHaveProp('testID', 'camera-flip-button');
    });
  });
});
