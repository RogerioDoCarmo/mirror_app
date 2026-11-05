# Raw captures

Real screenshots of the running app, one folder per platform. `../tools/compose.py`
turns them into every store image. Nothing here is a mockup: take them from a
release build (Firebase or the store build) of the version being published.

```text
raw/
  android/   a phone (the Poco)  -> all Google Play sets: phone, 7" and 10" tablet, landscape
  ios/       an iPhone           -> all App Store sets: iPhone 6.5" and iPad 12.9"
```

The tablet, landscape and iPad sets reuse the phone captures inside a device
frame, exactly as the 1.3.x sets did.

Each folder takes the same five PNG files (a plain device screenshot, no
editing; the tool scales it into a device frame):

| File             | What it must show                                                                     |
| ---------------- | ------------------------------------------------------------------------------------- |
| `mirror.png`     | Front camera, the three or four floating buttons visible, no zoom, no hint on screen. |
| `zoom.png`       | Zoomed in (about 2-3x) with a pinch; the "Pinch to zoom" tip already gone.            |
| `mirrored.png`   | The default mirror view, framed as in `unmirrored.png`.                               |
| `unmirrored.png` | The same pose after tapping the swap-arrows button, so the image is flipped.          |
| `back-torch.png` | Back camera with the flashlight switched on (its button shows as active).             |

Tips:

- For `mirrored.png` / `unmirrored.png`, hold a sheet with a word on it, or a
  book cover, in front of the front camera and do not move between the two
  shots. The text reads backwards in the mirror view and correctly in the other,
  which makes the difference obvious at a glance.
- A fresh install shows the one-time tips; wait about ten seconds (or pinch and
  tap once) before capturing, so no tip is on screen.
- Keep the face, room and any text free of personal information: these images are
  published.

## Current contents

`mirror`, `mirrored`, `unmirrored` and `zoom` in both folders are derived from
the 1.3.x store captures with `../tools/controls.py` (floating buttons drawn on,
picture flipped or digitally zoomed), because the 1.4.0 build could not be run
on a screenshot device when they were made. `back-torch.png` does not exist yet,
so the `05-back-camera` slide is skipped. Replace any of these with a real
capture of the same name and run `compose.py` again.
