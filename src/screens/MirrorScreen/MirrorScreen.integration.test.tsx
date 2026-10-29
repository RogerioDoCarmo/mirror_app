import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { LocaleProvider } from '@/application/providers/LocaleProvider';
import type { TranslationKey } from '@/core/domain/translations';
import { useCamera } from '@/hooks/useCamera';
import { en } from '@/i18n/translations/en';
import { MirrorScreen } from './MirrorScreen';

// Unlike MirrorScreen.test.tsx this file keeps the real useCamera hook (wrapped
// in a spy so the pinch handlers it hands to the screen can be driven), so it
// covers the whole path from a tap or a pinch to the props on the camera view.

jest.mock('@/hooks/useCamera', () => {
  const actual = jest.requireActual<typeof import('@/hooks/useCamera')>('@/hooks/useCamera');
  return { useCamera: jest.fn(actual.useCamera) };
});

jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

jest.mock('@/adapters/expo-localization/ExpoLocalizationAdapter', () => ({
  useExpoLocalization: jest.fn(),
}));

jest.mock('expo-camera', () => {
  const mockReact = require('react') as typeof import('react');
  const MockCameraView = ({
    testID,
    facing,
    zoom,
    mirror,
  }: {
    testID?: string;
    facing?: string;
    zoom?: number;
    mirror?: boolean;
  }) =>
    // The 'View' host component is what React Native's View renders, and unlike
    // View itself it accepts the camera-specific props asserted on below.
    mockReact.createElement('View', { testID: testID ?? 'camera-view', facing, zoom, mirror });
  return { CameraView: MockCameraView };
});

const mockUseCamera = jest.mocked(useCamera);
const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);
const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}
  >
    <LocaleProvider>
      <CameraProvider>{children}</CameraProvider>
    </LocaleProvider>
  </SafeAreaProvider>
);

const fingers = (distance: number) =>
  ({
    nativeEvent: {
      touches: [
        { pageX: 100, pageY: 300 },
        { pageX: 100 + distance, pageY: 300 },
      ],
    },
  }) as unknown as GestureResponderEvent;

/** Drives the handlers the screen received from the real hook: fingers `from` apart, then `to`, then lift. */
const pinch = (from: number, to: number) => {
  const results = mockUseCamera.mock.results;
  const latest = results[results.length - 1]!;
  if (latest.type !== 'return') {
    throw new Error('useCamera threw');
  }
  const { pinchHandlers } = latest.value;
  act(() => {
    pinchHandlers.onResponderGrant(fingers(from));
    pinchHandlers.onResponderMove(fingers(to));
    pinchHandlers.onResponderRelease(fingers(to));
  });
};

const FLIPPED = { transform: [{ scaleX: -1 }] };

describe('MirrorScreen — controls end to end', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoLocalization.mockReturnValue({
      locale: 'en',
      t: (key: TranslationKey) => en[key],
    });
    mockUseExpoCameraPermission.mockReturnValue({
      permission: { granted: true, canAskAgain: true },
      requestPermission: jest.fn(),
    });
  });

  it('starts as a mirror: front camera, mirrored, unzoomed, not flipped', () => {
    render(<MirrorScreen />, { wrapper });

    expect(screen.getByTestId('camera-view')).toHaveProp('facing', 'front');
    expect(screen.getByTestId('camera-view')).toHaveProp('mirror', true);
    expect(screen.getByTestId('camera-view')).toHaveProp('zoom', 0);
    expect(screen.getByTestId('pinch-zoom-area')).not.toHaveStyle(FLIPPED);
  });

  it('zooms the camera view as the fingers spread, and keeps the zoom between pinches', () => {
    render(<MirrorScreen />, { wrapper });

    pinch(100, 160);
    expect(screen.getByTestId('camera-view')).toHaveProp('zoom', expect.closeTo(0.3, 10));

    pinch(100, 140);
    expect(screen.getByTestId('camera-view')).toHaveProp('zoom', expect.closeTo(0.5, 10));
  });

  it('switches to the back camera, un-mirrors the native preview and resets the zoom', () => {
    render(<MirrorScreen />, { wrapper });
    pinch(100, 160);

    fireEvent.press(screen.getByTestId('camera-flip-button'));

    expect(screen.getByTestId('camera-view')).toHaveProp('facing', 'back');
    expect(screen.getByTestId('camera-view')).toHaveProp('mirror', false);
    expect(screen.getByTestId('camera-view')).toHaveProp('zoom', 0);
    expect(screen.getByTestId('pinch-zoom-area')).not.toHaveStyle(FLIPPED);
  });

  it('shows the view others see by flipping the preview, and back again', () => {
    render(<MirrorScreen />, { wrapper });

    fireEvent.press(screen.getByTestId('mirror-toggle-button'));

    expect(screen.getByTestId('pinch-zoom-area')).toHaveStyle(FLIPPED);
    expect(screen.getByRole('button', { name: 'Show mirror view' })).toBeTruthy();

    fireEvent.press(screen.getByTestId('mirror-toggle-button'));

    expect(screen.getByTestId('pinch-zoom-area')).not.toHaveStyle(FLIPPED);
    expect(screen.getByRole('button', { name: 'Show as others see you' })).toBeTruthy();
  });

  it('can mirror the back camera too', () => {
    render(<MirrorScreen />, { wrapper });
    fireEvent.press(screen.getByTestId('camera-flip-button'));

    fireEvent.press(screen.getByTestId('mirror-toggle-button'));

    expect(screen.getByTestId('camera-view')).toHaveProp('facing', 'back');
    expect(screen.getByTestId('pinch-zoom-area')).toHaveStyle(FLIPPED);
  });

  it('keeps pinch zoom working while the preview is flipped', () => {
    render(<MirrorScreen />, { wrapper });
    fireEvent.press(screen.getByTestId('mirror-toggle-button'));

    pinch(100, 160);

    expect(screen.getByTestId('pinch-zoom-area')).toHaveStyle(FLIPPED);
    expect(screen.getByTestId('camera-view')).toHaveProp('zoom', expect.closeTo(0.3, 10));
  });
});
