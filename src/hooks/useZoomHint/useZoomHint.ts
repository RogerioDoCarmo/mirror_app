import { useEffect, useState } from 'react';
import { useHintStore } from '@/application/providers/HintStoreProvider';
import { MIN_ZOOM } from '@/hooks/usePinchZoom/zoom';

/** How long (ms) the pinch-to-zoom hint stays on screen if the user does not pinch. */
export const ZOOM_HINT_DURATION_MS = 5000;

/**
 * Decides whether the pinch-to-zoom hint is on screen right now.
 *
 * The hint is for people who have never seen it: it shows once per device, as
 * soon as `ready` turns `true`, and is recorded as seen at that moment so a
 * launch cut short does not make it nag again. It goes away by itself after
 * {@link ZOOM_HINT_DURATION_MS}, or as soon as the preview is zoomed — a pinch
 * means the user has already got the message.
 *
 * Whether the hint is owed is decided once, when the screen mounts. Recording it
 * as seen therefore never pulls it off the screen early.
 *
 * @param ready `true` once the camera is on screen and the hint can be read.
 * @param zoom Current preview zoom, in `[0, 1]`.
 */
export function useZoomHint(ready: boolean, zoom: number): boolean {
  const { zoomHintSeen, markZoomHintSeen } = useHintStore();
  const [owed] = useState(!zoomHintSeen);
  const [dismissed, setDismissed] = useState(false);
  // A pinch means the user has got the message: latch the dismissal while
  // rendering, so a zoom back to 0 cannot bring the hint back.
  if (zoom > MIN_ZOOM && !dismissed) setDismissed(true);
  const visible = owed && ready && !dismissed;

  useEffect(() => {
    if (!visible) return;
    markZoomHintSeen();
    const id = setTimeout(() => {
      setDismissed(true);
    }, ZOOM_HINT_DURATION_MS);
    return () => {
      clearTimeout(id);
    };
  }, [visible, markZoomHintSeen]);

  return visible;
}
