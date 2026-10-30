import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { useExpoFileHintStore } from '@/adapters/expo-file-system/ExpoFileHintStoreAdapter';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { HintStoreProvider } from '@/application/providers/HintStoreProvider';
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

jest.mock('@/adapters/expo-file-system/ExpoFileHintStoreAdapter', () => ({
  useExpoFileHintStore: jest.fn(),
}));

jest.mock('expo-camera', () => {
  const mockReact = require('react') as typeof import('react');
  const MockCameraView = ({
    testID,
    facing,
    zoom,
    mirror,
    enableTorch,
  }: {
    testID?: string;
    facing?: string;
    zoom?: number;
    mirror?: boolean;
    enableTorch?: boolean;
  }) =>
    // The 'View' host component is what React Native's View renders, and unlike
    // View itself it accepts the camera-specific props asserted on below.
    mockReact.createElement('View', {
      testID: testID ?? 'camera-view',
      facing,
      zoom,
      mirror,
      enableTorch,
    });
  return { CameraView: MockCameraView };
});

const mockUseCamera = jest.mocked(useCamera);
const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);
const mockUseExpoLocalization = jest.mocked(useExpoLocalization);
const mockUseExpoFileHintStore = jest.mocked(useExpoFileHintStore);
const mockMarkZoomHintSeen = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}
  >
    <LocaleProvider>
      <HintStoreProvider>
        <CameraProvider>{children}</CameraProvider>
      </HintStoreProvider>
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
    // A returning user by default; the hint tests below make it a new one.
    mockUseExpoFileHintStore.mockReturnValue({
      zoomHintSeen: true,
      markZoomHintSeen: mockMarkZoomHintSeen,
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

  it('offers the flashlight on the back camera only, and never leaves it lit across a switch', () => {
    render(<MirrorScreen />, { wrapper });
    expect(screen.queryByTestId('torch-button')).toBeNull();
    expect(screen.getByTestId('camera-view')).toHaveProp('enableTorch', false);

    fireEvent.press(screen.getByTestId('camera-flip-button')); // back
    expect(screen.getByTestId('torch-button')).toBeTruthy();
    expect(screen.getByTestId('camera-view')).toHaveProp('enableTorch', false);

    fireEvent.press(screen.getByTestId('torch-button'));
    expect(screen.getByTestId('camera-view')).toHaveProp('enableTorch', true);
    expect(screen.getByRole('button', { name: 'Turn flashlight off' })).toBeTruthy();

    fireEvent.press(screen.getByTestId('camera-flip-button')); // front
    expect(screen.queryByTestId('torch-button')).toBeNull();
    expect(screen.getByTestId('camera-view')).toHaveProp('enableTorch', false);

    fireEvent.press(screen.getByTestId('camera-flip-button')); // back again
    expect(screen.getByTestId('camera-view')).toHaveProp('enableTorch', false);
    expect(screen.getByRole('button', { name: 'Turn flashlight on' })).toBeTruthy();
  });

  describe('zoom hint', () => {
    const asNewUser = () =>
      mockUseExpoFileHintStore.mockReturnValue({
        zoomHintSeen: false,
        markZoomHintSeen: mockMarkZoomHintSeen,
      });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('is shown to a new user and recorded as seen', () => {
      asNewUser();

      render(<MirrorScreen />, { wrapper });

      expect(screen.getByText('Pinch to zoom')).toBeTruthy();
      expect(mockMarkZoomHintSeen).toHaveBeenCalledTimes(1);
    });

    it('is not shown to a returning user', () => {
      render(<MirrorScreen />, { wrapper });

      expect(screen.queryByTestId('zoom-hint')).toBeNull();
      expect(mockMarkZoomHintSeen).not.toHaveBeenCalled();
    });

    it('is not shown while the camera permission is still being asked for', () => {
      asNewUser();
      mockUseExpoCameraPermission.mockReturnValue({
        permission: { granted: false, canAskAgain: true },
        requestPermission: jest.fn(),
      });

      render(<MirrorScreen />, { wrapper });

      expect(screen.queryByTestId('zoom-hint')).toBeNull();
      expect(mockMarkZoomHintSeen).not.toHaveBeenCalled();
    });

    it('disappears once the user pinches', () => {
      asNewUser();
      render(<MirrorScreen />, { wrapper });

      pinch(100, 160);

      expect(screen.queryByTestId('zoom-hint')).toBeNull();
      expect(screen.getByTestId('camera-view')).toHaveProp('zoom', expect.closeTo(0.3, 10));
    });

    it('disappears by itself after a few seconds', () => {
      jest.useFakeTimers();
      asNewUser();
      render(<MirrorScreen />, { wrapper });
      expect(screen.getByTestId('zoom-hint')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.queryByTestId('zoom-hint')).toBeNull();
    });
  });
});
