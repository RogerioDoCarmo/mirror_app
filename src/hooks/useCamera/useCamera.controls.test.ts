import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useExpoCameraPermission } from '@/adapters/expo-camera/ExpoCameraPermissionAdapter';
import { CameraProvider } from '@/application/providers/CameraProvider';
import { useCamera } from './useCamera';

jest.mock('@/adapters/expo-camera/ExpoCameraPermissionAdapter', () => ({
  useExpoCameraPermission: jest.fn(),
}));

const mockUseExpoCameraPermission = jest.mocked(useExpoCameraPermission);

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CameraProvider, null, children);

const setup = () => renderHook(() => useCamera(), { wrapper });

/** Two fingers on a horizontal line, `distance` points apart. */
const fingers = (distance: number) =>
  ({
    nativeEvent: {
      touches: [
        { pageX: 0, pageY: 0 },
        { pageX: distance, pageY: 0 },
      ],
    },
  }) as unknown as GestureResponderEvent;

/** Spreads two fingers from 100 to 160 points apart: scale 1.6, so zoom 0.3. */
const pinchOut = (result: ReturnType<typeof setup>['result']) => {
  act(() => {
    result.current.pinchHandlers.onResponderGrant(fingers(100));
    result.current.pinchHandlers.onResponderMove(fingers(160));
  });
};

describe('useCamera — facing, zoom and mirror', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoCameraPermission.mockReturnValue({
      permission: null,
      requestPermission: jest.fn(),
    });
  });

  it('starts on the front camera, mirrored, unzoomed and not flipped', () => {
    const { result } = setup();

    expect(result.current.facing).toBe('front');
    expect(result.current.nativeMirror).toBe(true);
    expect(result.current.showMirrored).toBe(true);
    expect(result.current.previewFlipped).toBe(false);
    expect(result.current.zoom).toBe(0);
  });

  it('switches from front to back and then back to front', () => {
    const { result } = setup();

    act(() => {
      result.current.toggleFacing();
    });
    expect(result.current.facing).toBe('back');

    act(() => {
      result.current.toggleFacing();
    });
    expect(result.current.facing).toBe('front');
  });

  it('turns the native mirror off on the back camera', () => {
    const { result } = setup();

    act(() => {
      result.current.toggleFacing();
    });

    expect(result.current.nativeMirror).toBe(false);
  });

  it('resets the zoom to 0 when the camera is switched', () => {
    const { result } = setup();
    pinchOut(result);
    expect(result.current.zoom).toBeCloseTo(0.3, 10);

    act(() => {
      result.current.toggleFacing();
    });

    expect(result.current.zoom).toBe(0);
  });

  it('pinch zoom works again after switching camera', () => {
    const { result } = setup();
    act(() => {
      result.current.toggleFacing();
    });

    pinchOut(result);

    expect(result.current.zoom).toBeCloseTo(0.3, 10);
  });

  it('toggles between the mirror view and the view others see', () => {
    const { result } = setup();

    act(() => {
      result.current.toggleMirrored();
    });
    expect(result.current.showMirrored).toBe(false);
    expect(result.current.previewFlipped).toBe(true);

    act(() => {
      result.current.toggleMirrored();
    });
    expect(result.current.showMirrored).toBe(true);
    expect(result.current.previewFlipped).toBe(false);
  });

  it('starts the back camera unmirrored and unflipped', () => {
    const { result } = setup();

    act(() => {
      result.current.toggleFacing();
    });

    expect(result.current.showMirrored).toBe(false);
    expect(result.current.previewFlipped).toBe(false);
  });

  it('flips the back camera when the mirror view is requested', () => {
    const { result } = setup();
    act(() => {
      result.current.toggleFacing();
    });

    act(() => {
      result.current.toggleMirrored();
    });

    expect(result.current.showMirrored).toBe(true);
    expect(result.current.previewFlipped).toBe(true);
  });

  it('puts the mirror choice back to the natural look of the camera it switches to', () => {
    const { result } = setup();
    act(() => {
      result.current.toggleMirrored(); // front, as others see you
    });

    act(() => {
      result.current.toggleFacing(); // back
    });
    expect(result.current.showMirrored).toBe(false);

    act(() => {
      result.current.toggleFacing(); // front again
    });
    expect(result.current.showMirrored).toBe(true);
    expect(result.current.previewFlipped).toBe(false);
  });

  it('keeps toggleMirrored referentially stable', () => {
    const { result, rerender } = setup();
    const first = result.current.toggleMirrored;

    act(() => {
      result.current.toggleMirrored();
    });
    rerender({});

    expect(result.current.toggleMirrored).toBe(first);
  });
});
