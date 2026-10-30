import { useCallback, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import type { IHintStorePort } from '@/core/ports/HintStorePort';

/** Name of the empty file whose presence means the pinch-to-zoom hint has been shown. */
const ZOOM_HINT_MARKER = 'zoom-hint-seen';

/** The marker lives in the app's document directory, which survives app updates. */
function zoomHintMarker(): File {
  return new File(Paths.document, ZOOM_HINT_MARKER);
}

/**
 * Whether the marker file exists.
 *
 * A file system that cannot be read counts as "seen": a hint that could never
 * be remembered would be shown on every launch, which is worse than not
 * showing it at all.
 */
function readZoomHintSeen(): boolean {
  try {
    return zoomHintMarker().exists;
  } catch {
    return true;
  }
}

/**
 * React hook adapter that implements {@link IHintStorePort} with an empty
 * marker file written through `expo-file-system`.
 *
 * This is the **only** file in the application that imports from
 * `expo-file-system`. The marker is a file rather than a key-value entry so the
 * app needs no storage library of its own: `expo-file-system` already ships
 * with Expo and is compiled from source in the F-Droid build.
 *
 * Failing to write the marker is deliberately silent: the worst outcome is
 * that the hint appears once more on the next launch.
 */
export function useExpoFileHintStore(): IHintStorePort {
  const [zoomHintSeen, setZoomHintSeen] = useState(readZoomHintSeen);

  // Stryker disable ArrayDeclaration -- equivalent mutant: the callback closes over nothing that changes, so [] and a non-empty dep list behave identically
  const markZoomHintSeen = useCallback(() => {
    setZoomHintSeen(true);
    try {
      zoomHintMarker().create({ overwrite: true });
    } catch {
      // Not being able to remember is not worth interrupting the user for.
    }
  }, []);
  // Stryker restore ArrayDeclaration

  return { zoomHintSeen, markZoomHintSeen };
}
