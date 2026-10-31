/**
 * Port for remembering, on this device, which one-time hints have been shown.
 *
 * The application layer depends on this interface; adapters (e.g.
 * `useExpoFileHintStore`) implement it. Nothing here is personal data: it is a
 * plain "has this been shown" flag that never leaves the device.
 */
export interface IHintStorePort {
  /** `true` once the pinch-to-zoom hint has been shown on this device. */
  zoomHintSeen: boolean;
  /** Records that the pinch-to-zoom hint has been shown, so it is not shown again. */
  markZoomHintSeen: () => void;
}
