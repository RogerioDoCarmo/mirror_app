# Architecture

Miroji is a deliberately simple app — a front-camera mirror — built as a showcase of
**production-grade engineering**. Its functionality could fit in 50 lines; instead it is
structured around a **Hexagonal (Ports & Adapters)** architecture so that every design
principle below has a concrete, auditable home in the code.

> This is an intentional demonstration. The "Trade-offs" section at the end is honest
> about where this rigour is overkill for a mirror app and where it would genuinely pay
> off in a product codebase.

---

## 1. The dependency rule

Source dependencies only ever point **inward**, toward the domain. The domain knows
nothing about React, Expo, or any library; the libraries are pushed to the very edge.

```
        ┌──────────────────────────────────────────────┐
        │                    UI layer                    │
        │        screens/ · components/ · hooks/         │
        └───────────────────────┬────────────────────────┘
                                 │ depends on
                                 ▼
        ┌──────────────────────────────────────────────┐
        │                 application/                   │
        │     CameraProvider · LocaleProvider  (DI)      │
        └───────────────────────┬────────────────────────┘
                                 │ provides an
                                 ▼
        ┌──────────────────────────────────────────────┐
        │                  core/ports                    │ ◄─ the contract
        │      ICameraPermissionPort · ILocalePort       │
        └───────────────────────┬────────────────────────┘
                  implemented by │   ▲ depends only on the interface
                                 ▼   │
        ┌──────────────────────────────────────────────┐
        │                   adapters/                    │
        │   ExpoCameraPermissionAdapter                  │
        │   ExpoLocalizationAdapter                      │
        │   (the ONLY importers of expo-* libraries)     │
        └───────────────────────┬────────────────────────┘
                                 │ wraps
                                 ▼
        ┌──────────────────────────────────────────────┐
        │     third-party: expo-camera, expo-localization │
        └──────────────────────────────────────────────┘

   core/domain — pure types (PermissionState, TranslationKey, SupportedLocale).
   Imported by every layer; imports nothing.
```

The key inversion: `expo-camera` is a **detail at the edge**, not a dependency the UI
knows about. Replacing it means writing one new adapter — nothing else changes.

---

## 2. Layer responsibilities

| Layer           | Directory                           | Knows about         | Example                                |
| --------------- | ----------------------------------- | ------------------- | -------------------------------------- |
| **Domain**      | `src/core/domain/`                  | nothing (pure TS)   | `PermissionState`, `TranslationKey`    |
| **Ports**       | `src/core/ports/`                   | domain only         | `ICameraPermissionPort`, `ILocalePort` |
| **Adapters**    | `src/adapters/`                     | ports + one library | `ExpoCameraPermissionAdapter`          |
| **Application** | `src/application/`                  | ports + adapters    | `CameraProvider` (DI via Context)      |
| **UI**          | `components/`, `screens/`, `hooks/` | ports only          | `PermissionGate`, `useCamera`          |

`ExpoCameraPermissionAdapter.ts` documents the boundary in its own header:
_"the **only** file in the application that imports from `expo-camera` for permission
concerns."_ The boundary is a convention enforced by review and by the folder layout.

---

## 3. SOLID, anchored to files

- **S — Single Responsibility.** `Button` styles a pressable; `PermissionGate` chooses a
  state; the adapter adapts; `useCamera` composes. One reason to change per file.
- **O — Open/Closed.** Adding Japanese was a new `i18n/translations/ja.ts` plus one union
  member in `TranslationKey` — **zero** edits to any rendering code.
- **L — Liskov Substitution.** Anything implementing `ICameraPermissionPort` is
  substitutable, which is precisely why tests inject a mock adapter and the app behaves
  identically.
- **I — Interface Segregation.** Ports are minimal: `ICameraPermissionPort` is
  `{ permission, requestPermission }`; `ILocalePort` is `{ locale, t }`. No fat interfaces.
- **D — Dependency Inversion.** `PermissionGate` consumes the domain's `PermissionState`,
  never `expo-camera`'s `PermissionResponse`. High-level policy depends on an abstraction;
  the library depends on the abstraction too.

---

## 4. Design patterns in use

| Pattern                  | Location                                                      | Why                                                                       |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Adapter**              | `adapters/expo-camera`, `adapters/expo-localization`          | wrap third-party hooks behind a port                                      |
| **Dependency Injection** | `CameraProvider`, `LocaleProvider`                            | inject a port implementation through React Context                        |
| **Facade**               | `hooks/useCamera`                                             | hides permission lifecycle + `cameraRef` + `isReady` behind one hook      |
| **Guard / Gate**         | `components/PermissionGate`                                   | renders one of four permission states, keeping `MirrorScreen` declarative |
| **Strategy**             | `i18n/translations/*` selected at runtime; swappable adapters | behaviour chosen by data/config                                           |
| **Fail-fast**            | `useLocale`, `useCameraPermission`                            | throw immediately if used outside their provider                          |

---

## 5. Type-driven domain modeling

The domain makes **illegal states unrepresentable**, so whole classes of bug cannot compile:

```ts
// core/domain/permission.ts — exactly the four real-world states, nothing else
type PermissionState =
  | null // loading / undetermined
  | { granted: true; canAskAgain: boolean }
  | { granted: false; canAskAgain: boolean };

// core/domain/translations.ts — forgetting a translation is a COMPILE error
type TranslationKey =
  'permission.cameraRequired' | 'permission.grantButton' | 'permission.openSettings';
type TranslationMap = Record<TranslationKey, string>;
```

`TranslationMap` being a strict `Record` means each of the four locale files
(`en`, `pt`, `es`, `ja`) must define every key or the build fails — i18n completeness is
guaranteed by the type checker, not by discipline.

---

## 6. Resilience: the camera-permission watchdog

`createPermissionHook` inside `expo-modules-core` has no try/catch around its initial
`getCameraPermissionsAsync()`. On CI runners (and any device whose camera TurboModule
rejects), the promise is swallowed and `useCameraPermissions()` stays `null` forever —
an infinite spinner.

`ExpoCameraPermissionAdapter` adds a **15-second watchdog** (`NATIVE_MODULE_TIMEOUT_MS`)
that falls back to `{ granted: false, canAskAgain: true }`, so the rationale UI always
renders. The fallback is defensive code, and it is itself covered by three tests
(pre-timeout, exact-timeout, module-responds-first).

This is the project's stance on comments: they explain **why**, never what. The watchdog,
the `accessible={true}` rationale, and the `// Stryker disable` annotations all document
non-obvious decisions a future reader would otherwise have to reverse-engineer.

---

## 7. Testing as a design force

Testability is treated as a first-class consequence of the architecture, not an
afterthought.

| Tier               | Tool        | What it proves                              |
| ------------------ | ----------- | ------------------------------------------- |
| Unit / integration | Jest + RNTL | behaviour of each unit                      |
| Property-based     | fast-check  | invariants hold for **any** generated input |
| Mutation           | Stryker     | the tests actually **catch** injected bugs  |
| End-to-end         | Maestro     | the real app works on iOS + Android         |

- **The ports make mocking trivial** — a test renders a `CameraProvider` over a mocked
  adapter and the component under test is fully isolated from `expo-camera`.
- **Property-based tests** assert invariants like _"`permission=null` always renders the
  spinner and never renders children, for any input"_.
- **Mutation testing** keeps the 100% line coverage honest: a test suite that doesn't
  detect mutants is coverage theatre. Deliberate `// Stryker disable` annotations document
  equivalent-mutant reasoning rather than hiding it.

---

## 8. Trade-offs (the honest part)

Good architecture is about appropriate trade-offs, so here are this project's:

- **Hexagonal architecture is over-engineered for a one-screen mirror app.** A pragmatic
  build would call `useCameraPermissions()` directly and save ~5 files of indirection.
  The ports/adapters layering earns its keep _here_ because the explicit goal is to
  demonstrate the pattern on an auditable codebase. In a product, you would want each
  abstraction to be paying for a real second implementation or a genuine swap risk before
  introducing it.
- **`accessibilityLabel` doubles as an E2E test selector** (e.g. `"permission-rationale"`).
  This slightly muddies screen-reader semantics in exchange for locale-independent,
  Fabric-reliable test matching. It is a conscious, documented trade-off — not an
  accident — but it is the one place where testability and accessibility purity rub
  against each other.
- **Provider-per-concern** (`CameraProvider`, `LocaleProvider`) is clean but will nest as
  concerns grow; a composed root provider would be the next refactor.

---

## 9. Where to look first

| To understand…            | Start at                                                     |
| ------------------------- | ------------------------------------------------------------ |
| The dependency boundary   | `src/core/ports/CameraPermissionPort.ts`                     |
| How a library is isolated | `src/adapters/expo-camera/ExpoCameraPermissionAdapter.ts`    |
| How DI is wired           | `src/application/providers/CameraProvider.tsx`               |
| The four-state UI logic   | `src/components/PermissionGate/PermissionGate.tsx`           |
| Type-safe i18n            | `src/core/domain/translations.ts` + `src/i18n/translations/` |
