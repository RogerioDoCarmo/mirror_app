import { useCallback, useEffect, useState } from 'react';
import { useHintStore } from '@/application/providers/HintStoreProvider';

/** How long (ms) the flip hint stays on screen if the user does not press the flip button. */
export const FLIP_HINT_DURATION_MS = 5000;

/** What {@link useFlipHint} returns. */
export type UseFlipHintReturn = {
  /** `true` while the flip hint is on screen. */
  visible: boolean;
  /** Call when the user presses the flip button: they have found it, so the hint is done. */
  dismiss: () => void;
};

/**
 * Decides whether the flip hint ("tap to see yourself as others do") is on
 * screen right now.
 *
 * Like the zoom hint, it is for people who have never seen it: it shows once per
 * device, as soon as `ready` turns `true`, and is recorded as seen at that
 * moment so a launch cut short does not make it nag again. It has a marker of
 * its own, so people who already saw the zoom hint before this one existed are
 * still told about the flip button once.
 *
 * It waits while `blocked` is `true`, so it never shares the screen with the
 * zoom hint: new users see the zoom hint first and this one right after it.
 * Nothing is recorded while it waits.
 *
 * It goes away by itself after {@link FLIP_HINT_DURATION_MS}, or as soon as the
 * user presses the flip button (`dismiss`). Pressing the button before the hint
 * ever appeared also records it as seen: that person does not need telling.
 *
 * Whether the hint is owed is decided once, when the screen mounts. Recording it
 * as seen therefore never pulls it off the screen early.
 *
 * @param ready `true` once the camera is on screen and the hint can be read.
 * @param blocked `true` while another hint is on screen and this one must wait.
 */
export function useFlipHint(ready: boolean, blocked: boolean): UseFlipHintReturn {
  const { flipHintSeen, markFlipHintSeen } = useHintStore();
  const [owed] = useState(!flipHintSeen);
  const [dismissed, setDismissed] = useState(false);
  const visible = owed && ready && !blocked && !dismissed;

  useEffect(() => {
    if (!visible) return;
    markFlipHintSeen();
    const id = setTimeout(() => {
      setDismissed(true);
    }, FLIP_HINT_DURATION_MS);
    return () => {
      clearTimeout(id);
    };
  }, [visible, markFlipHintSeen]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    // Once it has been on screen it is already recorded; this covers pressing the button before then.
    if (owed && !visible && !dismissed) markFlipHintSeen();
  }, [owed, visible, dismissed, markFlipHintSeen]);

  return { visible, dismiss };
}
