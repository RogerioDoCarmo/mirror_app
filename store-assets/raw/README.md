# Raw captures

Real screenshots of the running app, one folder per store slot (same names as
`../screenshots/`). `../tools/compose.py` turns them into the store images.
Nothing here is a mockup: take them from a release build (Firebase or the store
build) of the version being published.

```text
raw/
  android/phone/          Poco / any phone          -> Google Play phone
  android/tablet-7in/     7" tablet or emulator     -> Google Play 7" tablet
  android/tablet-10in/    10" tablet or emulator    -> Google Play 10" tablet
  android/landscape/      tablet, held sideways     -> Google Play Chromebook / XR
  ios/phone/              iPhone                    -> App Store iPhone 6.5"
  ios/ipad/               iPad                      -> App Store iPad 12.9"
```

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
