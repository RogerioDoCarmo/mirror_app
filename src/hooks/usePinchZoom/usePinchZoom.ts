import { useCallback, useMemo, useRef, useState } from 'react';
import type { GestureResponderEvent, ViewProps } from 'react-native';
import { MIN_ZOOM, distanceBetween, pinchScale, zoomFromPinchScale } from './zoom';

/** Responder props to spread on the `View` that should react to the pinch. */
export type PinchResponderHandlers = {
  [
    K in
      | 'onStartShouldSetResponder'
      | 'onMoveShouldSetResponder'
      | 'onResponderGrant'
      | 'onResponderMove'
      | 'onResponderRelease'
      | 'onResponderTerminate'
      | 'onResponderTerminationRequest'
  ]: NonNullable<ViewProps[K]>;
};

/** Shape returned by {@link usePinchZoom}. */
export type UsePinchZoomReturn = {
  /** Current zoom level in `[0, 1]`, ready for `<CameraView zoom>`. */
  zoom: number;
  /** Responder handlers that turn a two-finger pinch into zoom changes. */
  pinchHandlers: PinchResponderHandlers;
  /** Returns the zoom to its unmagnified level. */
  resetZoom: () => void;
};

/** The reference a pinch is measured against: finger distance and zoom when it began. */
type PinchBaseline = Readonly<{ startDistance: number; startZoom: number }>;

/** `true` while at least two fingers are down — a single finger never claims the responder. */
function hasTwoFingers(event: GestureResponderEvent): boolean {
  return event.nativeEvent.touches.length >= 2;
}

/**
 * Tracks the camera zoom driven by a two-finger pinch.
 *
 * Built on React Native's own responder system rather than a gesture library:
 * the only gesture needed is "distance between two fingers", and the responder
 * props work in unit tests without native modules or a root wrapper view.
 *
 * The zoom persists between gestures: each pinch is measured against the zoom
 * in effect when two fingers first touched, then converted through
 * {@link zoomFromPinchScale}. If a finger lifts mid-pinch and comes back, the
 * baseline is re-taken so the preview never jumps.
 */
export function usePinchZoom(): UsePinchZoomReturn {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  // Mirrors `zoom` so handlers created once can read the latest value.
  const zoomRef = useRef(MIN_ZOOM);
  const baselineRef = useRef<PinchBaseline | null>(null);

  // Stryker disable ArrayDeclaration -- equivalent mutant: setZoom is a stable state setter and the refs never change, so [] and [dep] behave identically
  const applyZoom = useCallback((next: number) => {
    zoomRef.current = next;
    setZoom(next);
  }, []);

  const resetZoom = useCallback(() => {
    applyZoom(MIN_ZOOM);
  }, [applyZoom]);

  const pinchHandlers = useMemo<PinchResponderHandlers>(() => {
    const track = (event: GestureResponderEvent) => {
      const [first, second] = event.nativeEvent.touches;
      if (!first || !second) {
        // A finger lifted: forget the baseline so a returning finger starts afresh.
        baselineRef.current = null;
        return;
      }
      const distance = distanceBetween(first, second);
      const baseline = baselineRef.current;
      if (baseline === null) {
        baselineRef.current = { startDistance: distance, startZoom: zoomRef.current };
        return;
      }
      applyZoom(
        zoomFromPinchScale(baseline.startZoom, pinchScale(baseline.startDistance, distance)),
      );
    };
    const end = () => {
      baselineRef.current = null;
    };

    return {
      onStartShouldSetResponder: hasTwoFingers,
      onMoveShouldSetResponder: hasTwoFingers,
      onResponderGrant: track,
      onResponderMove: track,
      onResponderRelease: end,
      onResponderTerminate: end,
      // Once pinching, keep the gesture: nothing else on screen should steal it.
      onResponderTerminationRequest: () => false,
    };
  }, [applyZoom]);
  // Stryker restore ArrayDeclaration

  return { zoom, pinchHandlers, resetZoom };
}
