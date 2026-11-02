import { act, renderHook } from '@testing-library/react-native';
import type { GestureResponderEvent } from 'react-native';
import type { PinchResponderHandlers } from './usePinchZoom';
import { usePinchZoom } from './usePinchZoom';

/** Builds a responder event whose touches sit at the given [x, y] screen points. */
function touchEvent(...points: [number, number][]): GestureResponderEvent {
  return {
    nativeEvent: { touches: points.map(([pageX, pageY]) => ({ pageX, pageY })) },
  } as unknown as GestureResponderEvent;
}

/** Two fingers resting on a horizontal line, `distance` points apart. */
const fingers = (distance: number) => touchEvent([100, 300], [100 + distance, 300]);

/**
 * Runs one complete pinch: the fingers land `start` apart, then move to each of
 * `distances` in turn, then lift.
 */
function pinch(handlers: PinchResponderHandlers, start: number, distances: number[]) {
  act(() => {
    handlers.onResponderGrant(fingers(start));
    distances.forEach((distance) => {
      handlers.onResponderMove(fingers(distance));
    });
    handlers.onResponderRelease(touchEvent());
  });
}

describe('usePinchZoom', () => {
  it('starts unzoomed', () => {
    const { result } = renderHook(() => usePinchZoom());

    expect(result.current.zoom).toBe(0);
  });

  it('zooms in as the fingers spread apart', () => {
    const { result } = renderHook(() => usePinchZoom());

    // 100 -> 160 is scale 1.6, which adds (1.6 - 1) * 0.5 = 0.3.
    pinch(result.current.pinchHandlers, 100, [120, 160]);

    expect(result.current.zoom).toBeCloseTo(0.3, 10);
  });

  it('keeps the zoom reached when the fingers lift', () => {
    const { result } = renderHook(() => usePinchZoom());

    pinch(result.current.pinchHandlers, 100, [150]);

    expect(result.current.zoom).toBeCloseTo(0.25, 10);
  });

  it('accumulates zoom across separate gestures instead of resetting to 0', () => {
    const { result } = renderHook(() => usePinchZoom());

    pinch(result.current.pinchHandlers, 100, [140]);
    pinch(result.current.pinchHandlers, 100, [140]);

    expect(result.current.zoom).toBeCloseTo(0.4, 10);
  });

  it('zooms back out from the accumulated level when the fingers pinch together', () => {
    const { result } = renderHook(() => usePinchZoom());

    pinch(result.current.pinchHandlers, 100, [180]);
    pinch(result.current.pinchHandlers, 100, [80]);

    expect(result.current.zoom).toBeCloseTo(0.3, 10);
  });

  it('clamps the zoom to the maximum', () => {
    const { result } = renderHook(() => usePinchZoom());

    pinch(result.current.pinchHandlers, 100, [500]);

    expect(result.current.zoom).toBe(1);
  });

  it('clamps the zoom to the minimum', () => {
    const { result } = renderHook(() => usePinchZoom());

    pinch(result.current.pinchHandlers, 100, [10]);

    expect(result.current.zoom).toBe(0);
  });

  it('does not change the zoom on the grant event alone', () => {
    const { result } = renderHook(() => usePinchZoom());

    act(() => {
      result.current.pinchHandlers.onResponderGrant(fingers(100));
    });

    expect(result.current.zoom).toBe(0);
  });

  it('measures the distance between the fingers diagonally, not along one axis', () => {
    const { result } = renderHook(() => usePinchZoom());

    act(() => {
      result.current.pinchHandlers.onResponderGrant(touchEvent([0, 0], [30, 40]));
      // Distance goes from 50 to 100: scale 2, so zoom 0.5.
      result.current.pinchHandlers.onResponderMove(touchEvent([0, 0], [60, 80]));
    });

    expect(result.current.zoom).toBeCloseTo(0.5, 10);
  });

  it('ignores a single finger moving', () => {
    const { result } = renderHook(() => usePinchZoom());

    act(() => {
      result.current.pinchHandlers.onResponderMove(touchEvent([10, 10]));
    });

    expect(result.current.zoom).toBe(0);
  });

  it('re-takes the baseline when a finger lifts mid-pinch and returns, so the zoom does not jump', () => {
    const { result } = renderHook(() => usePinchZoom());
    const { pinchHandlers } = result.current;

    act(() => {
      pinchHandlers.onResponderGrant(fingers(100));
      pinchHandlers.onResponderMove(fingers(150)); // zoom 0.25
      pinchHandlers.onResponderMove(touchEvent([100, 300])); // one finger lifted
      pinchHandlers.onResponderMove(fingers(400)); // finger returns far away
    });

    expect(result.current.zoom).toBeCloseTo(0.25, 10);

    act(() => {
      pinchHandlers.onResponderMove(fingers(800)); // scale 2 against the new baseline
    });

    expect(result.current.zoom).toBeCloseTo(0.75, 10);
  });

  it('starts a new gesture from a fresh baseline after the responder is terminated', () => {
    const { result } = renderHook(() => usePinchZoom());
    const { pinchHandlers } = result.current;

    act(() => {
      pinchHandlers.onResponderGrant(fingers(100));
      pinchHandlers.onResponderMove(fingers(150));
      pinchHandlers.onResponderTerminate(touchEvent());
      pinchHandlers.onResponderGrant(fingers(300));
      pinchHandlers.onResponderMove(fingers(450));
    });

    // First pinch left 0.25; second is scale 1.5 on top of it: 0.25 + 0.25.
    expect(result.current.zoom).toBeCloseTo(0.5, 10);
  });

  it('does not divide by zero when both fingers land on the same point', () => {
    const { result } = renderHook(() => usePinchZoom());

    act(() => {
      result.current.pinchHandlers.onResponderGrant(touchEvent([50, 50], [50, 50]));
      result.current.pinchHandlers.onResponderMove(fingers(100));
    });

    expect(result.current.zoom).toBe(0);
  });

  it('returns to 0 when resetZoom is called', () => {
    const { result } = renderHook(() => usePinchZoom());
    pinch(result.current.pinchHandlers, 100, [160]);

    act(() => {
      result.current.resetZoom();
    });

    expect(result.current.zoom).toBe(0);
  });

  it('starts the next gesture from 0 after a reset', () => {
    const { result } = renderHook(() => usePinchZoom());
    pinch(result.current.pinchHandlers, 100, [160]);
    act(() => {
      result.current.resetZoom();
    });

    pinch(result.current.pinchHandlers, 100, [140]);

    expect(result.current.zoom).toBeCloseTo(0.2, 10);
  });

  describe('responder negotiation', () => {
    it('does not claim the responder for a single finger', () => {
      const { result } = renderHook(() => usePinchZoom());
      const { onStartShouldSetResponder, onMoveShouldSetResponder } = result.current.pinchHandlers;

      expect(onStartShouldSetResponder(touchEvent([1, 1]))).toBe(false);
      expect(onMoveShouldSetResponder(touchEvent([1, 1]))).toBe(false);
    });

    it('claims the responder as soon as two fingers are down', () => {
      const { result } = renderHook(() => usePinchZoom());
      const { onStartShouldSetResponder, onMoveShouldSetResponder } = result.current.pinchHandlers;

      expect(onStartShouldSetResponder(fingers(100))).toBe(true);
      expect(onMoveShouldSetResponder(fingers(100))).toBe(true);
    });

    it('still claims the responder with three fingers down', () => {
      const { result } = renderHook(() => usePinchZoom());

      expect(
        result.current.pinchHandlers.onMoveShouldSetResponder(touchEvent([0, 0], [10, 0], [20, 0])),
      ).toBe(true);
    });

    it('refuses to hand the responder to anyone else mid-pinch', () => {
      const { result } = renderHook(() => usePinchZoom());

      expect(result.current.pinchHandlers.onResponderTerminationRequest(fingers(100))).toBe(false);
    });
  });

  describe('referential stability', () => {
    it('keeps the same handlers object across re-renders', () => {
      const { result, rerender } = renderHook(() => usePinchZoom());
      const first = result.current.pinchHandlers;

      pinch(first, 100, [150]);
      rerender({});

      expect(result.current.pinchHandlers).toBe(first);
    });

    it('keeps the same resetZoom reference across re-renders', () => {
      const { result, rerender } = renderHook(() => usePinchZoom());
      const first = result.current.resetZoom;

      rerender({});

      expect(result.current.resetZoom).toBe(first);
    });
  });
});
