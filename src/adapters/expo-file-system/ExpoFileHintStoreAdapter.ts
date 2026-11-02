import { useCallback, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import type { IHintStorePort } from '@/core/ports/HintStorePort';

/** Name of the empty file whose presence means the pinch-to-zoom hint has been shown. */
const ZOOM_HINT_MARKER = 'zoom-hint-seen';

/**
 * Name of the empty file whose presence means the flip hint has been shown.
 *
 * It is a file of its own, not a reuse of the zoom marker: people who installed
 * Miroji before the flip hint existed already have `zoom-hint-seen`, and they
 * should still be told about the flip button once.
 */
const FLIP_HINT_MARKER = 'flip-hint-seen';

/** The markers live in the app's document directory, which survives app updates. */
function markerFile(name: string): File {
  return new File(Paths.document, name);
}

/**
 * Whether the marker file called `name` exists.
 *
 * A file system that cannot be read counts as "seen": a hint that could never
 * be remembered would be shown on every launch, which is worse than not
 * showing it at all.
 */
function readSeen(name: string): boolean {
  try {
    return markerFile(name).exists;
  } catch {
    return true;
  }
}

/** Writes the marker file called `name`; failing to is deliberately silent. */
function writeMarker(name: string): void {
  try {
    markerFile(name).create({ overwrite: true });
  } catch {
    // Not being able to remember is not worth interrupting the user for.
  }
}

/**
 * React hook adapter that implements {@link IHintStorePort} with one empty
 * marker file per hint, written through `expo-file-system`.
 *
 * This is the **only** file in the application that imports from
 * `expo-file-system`. The markers are files rather than key-value entries so the
 * app needs no storage library of its own: `expo-file-system` already ships
 * with Expo and is compiled from source in the F-Droid build.
 *
 * Failing to write a marker is deliberately silent: the worst outcome is
 * that the hint appears once more on the next launch.
 */
export function useExpoFileHintStore(): IHintStorePort {
  const [zoomHintSeen, setZoomHintSeen] = useState(() => readSeen(ZOOM_HINT_MARKER));
  const [flipHintSeen, setFlipHintSeen] = useState(() => readSeen(FLIP_HINT_MARKER));

  // Stryker disable ArrayDeclaration -- equivalent mutant: the callbacks close over nothing that changes, so [] and a non-empty dep list behave identically
  const markZoomHintSeen = useCallback(() => {
    setZoomHintSeen(true);
    writeMarker(ZOOM_HINT_MARKER);
  }, []);

  const markFlipHintSeen = useCallback(() => {
    setFlipHintSeen(true);
    writeMarker(FLIP_HINT_MARKER);
  }, []);
  // Stryker restore ArrayDeclaration

  return { zoomHintSeen, markZoomHintSeen, flipHintSeen, markFlipHintSeen };
}
