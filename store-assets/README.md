# Store Assets

The exact screenshot sets submitted to the App Store and Google Play, kept under
version control so the published store listings are reproducible and auditable.

Each folder holds the complete 6-screenshot set for one device form factor, in
display order:

```text
01-hero · 02-mirror · 03-privacy · 04-languages · 05-permission · 06-open-settings
```

Every screenshot is a real capture of the running app (not a mockup), composited
onto a consistent gradient + device-frame template.

## Contents

| Path                               | Store slot                    | Dimensions |
| ---------------------------------- | ----------------------------- | ---------- |
| `screenshots/android/phone/`       | Google Play — Phone           | 1080×1920  |
| `screenshots/android/tablet-7in/`  | Google Play — 7″ tablet       | 1200×1920  |
| `screenshots/android/tablet-10in/` | Google Play — 10″ tablet      | 1600×2560  |
| `screenshots/android/landscape/`   | Google Play — Chromebook / XR | 1920×1080  |
| `screenshots/ios/phone/`           | App Store — iPhone 6.5″       | 1242×2688  |
| `screenshots/ios/ipad/`            | App Store — iPad 12.9″        | 2064×2752  |

First submitted with **v1.3.1 (build 20)**.
