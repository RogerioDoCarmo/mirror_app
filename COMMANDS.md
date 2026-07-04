# Development Commands Reference

Quick reference for common CLI commands used in this project.

> Package manager: **pnpm** (not npm/yarn). CI, EAS, and every command below assume pnpm.

## Common Commands

These are the most frequently used commands during development:

```bash
pnpm start                   # Start the Metro bundler only (app must already be installed)
pnpm android                 # Build, install and run on Android (emulator/device) + start Metro
pnpm ios                     # Build, install and run on iOS (simulator/device) + start Metro

pnpm storybook               # Start on-device Storybook (Expo Go / dev client)
pnpm storybook:web           # Start web Storybook (http://localhost:6006)
pnpm test:coverage           # Run tests with coverage report
pnpm test:e2e                # Run E2E tests with Maestro
pnpm mutation                # Run Stryker mutation tests
pnpm lint                    # Run ESLint to check code quality
pnpm typecheck               # Run TypeScript compiler checks (no emit)
pnpm format:check            # Check code formatting without fixing
pnpm format                  # Auto-fix all formatting issues (alias for: prettier --write .)

# Publish Storybook to Chromatic (token passed as env variable, never stored in code)
CHROMATIC_PROJECT_TOKEN=<your-token> pnpm chromatic
```

## Local Development (Android/iOS) — build + connect to Metro

This is the thing that's easy to forget: **which command rebuilds the native app vs. which one just talks to an already-installed app.**

```bash
pnpm android   # expo run:android — builds the native app, installs it on the
               # first booted emulator/connected device, AND starts Metro so the
               # app connects to it automatically. Use this the FIRST time, or
               # any time NATIVE code changed (new native deps, app.json/plugins,
               # permissions, splash screen, icons).

pnpm ios       # expo run:ios — same, but for the iOS simulator/device.

pnpm start     # expo start — starts ONLY the Metro bundler. Use this when the
               # native binary is already installed and only JS changed — no
               # rebuild needed, just reopen the app (or it Fast-Refreshes
               # automatically while running).
```

**Target a specific simulator/device** (useful when more than one is booted):

```bash
pnpm run:android   # expo run:android --device — opens a device/emulator picker
pnpm run:ios        # expo run:ios --device — opens a simulator/device picker

# Or target one directly by UDID (skip the picker):
xcrun simctl list devices booted            # find the booted simulator's UDID
npx expo run:ios --device "<UDID>"
```

**Known gotcha (iOS/CocoaPods):** if `pnpm ios` / `expo run:ios` fails during `pod install` with a Ruby `Unicode Normalization` / `Encoding::CompatibilityError` crash, the shell isn't in a UTF-8 locale. Fix:

```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pnpm ios
```

## Testing

```bash
pnpm test                   # Run all tests once
pnpm test:watch              # Run tests in watch mode
pnpm test:coverage           # Run tests with coverage report
pnpm test:ci                 # Coverage + CI flags (used by the CI workflow)
pnpm test:e2e                # Run E2E tests with Maestro (.maestro/flows/)
pnpm mutation                 # Run Stryker mutation tests
pnpm test -- path/to/test    # Run a specific test file
```

### Mutation Tests

Stryker measures test _quality_ by mutating source code and checking whether the suite catches it. Config: `stryker.config.json`. HTML report lands in `reports/`.

```bash
pnpm mutation                                     # Full run
npx stryker run --mutate "src/<file>.ts"          # Single file (faster, for iterating)
```

### E2E Tests (Maestro)

```bash
pnpm test:e2e                                          # Run all flows
maestro test .maestro/flows/mirror_permission_flow.yaml # Run a single flow
```

E2E runs automatically in CI on every PR but is **non-blocking** (Lint/Typecheck/Test is the only required check) — E2E takes ~30–40 min, so it's fine to merge a green PR without waiting for it when the change doesn't touch app/source code.

## Storybook

There are **two separate Storybook configs** — don't mix them up:

```bash
pnpm storybook       # On-device Storybook (.rnstorybook/) — runs inside Expo Go /
                      # the dev client, for browsing components on a real device/simulator.

pnpm storybook:web    # Web Storybook (.storybook/) — Vite + react-native-web,
                       # http://localhost:6006. This is what Chromatic publishes.

pnpm build-storybook   # Build the web Storybook static site (storybook-static/)
CHROMATIC_PROJECT_TOKEN=<token> pnpm chromatic   # Publish it + run visual regression tests
```

## Code Quality

```bash
pnpm lint            # Run ESLint
pnpm lint:fix         # Run ESLint and auto-fix what it can
pnpm format           # Auto-fix formatting with Prettier
pnpm format:check     # Check formatting without fixing
pnpm typecheck        # Run tsc --noEmit
```

## Building for the Stores (EAS)

```bash
# Cloud builds (queue, ~15–45 min depending on load)
pnpm build:apk        # Android preview APK
pnpm build:aab        # Android production AAB (Play Store)
pnpm build:ipa        # iOS production IPA (App Store / TestFlight)

# Local builds (compile on this machine — skips the cloud queue, faster)
pnpm build:apk:local
pnpm build:aab:local
pnpm build:ipa:local

# Submit the latest build to the store (uses the stored EAS credentials)
eas submit --platform ios --profile production --latest
eas submit --platform android --profile production --latest
```

## Git Workflow

### Branch Strategy (Git Flow — STRICT)

- **`main`** — production-ready, protected. Updated **only** via a PR from `develop`.
- **`develop`** — integration branch. Updated **only** via PRs from feature branches.

```text
main (production) ← PR ← develop (integration) ← PR ← feature/task-name (development)
```

**Rules:**

1. Feature branches are created **from `develop`**.
2. Feature PRs merge into `develop`.
3. Release PRs merge from `develop` into `main`.
4. `main` is protected — no direct commits.
5. **Never `git rebase`** on this project (or any project), unless explicitly requested. Resolve conflicts by merging or recreating the branch — never rewrite history.
6. Required check to merge: **`Lint, Typecheck & Test`** only. E2E runs but does not block merging.

### Feature Development Workflow

```bash
# 1. Start a new feature from develop
git checkout develop
git pull origin develop
git checkout -b feature/task-name

# 2. Make changes, then validate before committing
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm format:check

# 3. Commit and push
git add <files>
git commit -m "type: message"
git push -u origin feature/task-name

# 4. Open a PR into develop (via GitHub)
# 5. After it merges, sync local and delete the branch
git checkout develop
git pull origin develop
git branch -d feature/task-name

# 6. When ready to release, open a separate PR: develop → main
```

### Common Git Commands

```bash
git status                    # Check current status
git add <files>                # Stage specific files (avoid `git add -A`/`.` — risk of sweeping in local-only files)
git commit -m "type: message"  # Commit with a conventional message
git push origin branch-name    # Push to remote
git checkout -b feature/name   # Create a new branch
git pull origin develop        # Pull latest changes from develop
git branch -d branch-name      # Delete a merged branch (safe)
git fetch --prune              # Remove deleted remote branches from local tracking
```

**Important:** always use `-d` (lowercase) when deleting branches — it refuses to delete unmerged work. Never use `-D` (uppercase, force-delete) unless you're certain. Never `git rebase` unless explicitly asked.

### Commit Message Format

Conventional commits:

- `feat:` — new feature
- `fix:` — bug fix
- `build:` — build system / dependency / native-config changes
- `ci:` — CI/CD workflow changes
- `test:` — adding or updating tests
- `docs:` — documentation changes
- `style:` — code style changes (formatting, etc.)
- `refactor:` — code refactoring
- `chore:` — maintenance tasks (dependency bumps, etc.)

## Package Management

```bash
pnpm install                  # Install dependencies
pnpm add <package>             # Add a new package
pnpm add -D <package>          # Add a new dev dependency
pnpm remove <package>          # Remove a package
pnpm outdated                  # Check for outdated packages
pnpm dedupe                    # Deduplicate the lockfile
```

**Expo-managed packages (`expo-*`, `react-native`, etc.):** always install/upgrade with `npx expo install <package>`, **not** `pnpm add`. This resolves the SDK-compatible version instead of latest — installing the wrong version can break the native build (has happened before in this repo).

```bash
npx expo install <package>        # Correct way to add/upgrade an Expo-managed package
npx expo install --check          # Check all deps are on SDK-compatible versions
npx expo install --fix            # Auto-fix any that aren't
```

## Useful Shortcuts

```bash
# In the Metro bundler terminal (while pnpm start / android / ios is running):
r     # Reload the app
m     # Open the dev menu
j     # Open the JS debugger
a     # Open on Android
i     # Open on iOS

# Clear terminal
clear   # or Ctrl+L (macOS/Linux)

# Stop a running process
Ctrl+C

# View recent commits
git log --oneline -10

# View git diff
git diff

# Undo the last commit (keep changes staged)
git reset --soft HEAD~1
```

## Project-Specific Notes

- **Read the versioned Expo docs before writing code**: `https://docs.expo.dev/versions/v54.0.0/` (this project pins Expo SDK 54; APIs shift between SDK versions).
- **Default locale**: English. **Supported locales**: en, pt, es, ja.
- **Test stack**: Jest + React Native Testing Library (unit/integration), fast-check (property-based), Stryker (mutation), Maestro (E2E).
- **Two Storybook configs**: `.rnstorybook/` (on-device) vs `.storybook/` (web, used by Chromatic) — see the Storybook section above.
- **Coverage threshold**: 80%+ branches/functions/lines/statements (currently at 100%).
- **iOS submit auth**: handled via a stored App Store Connect API key on EAS's servers — no local `.p8` file needed.
- **Android store submit**: needs `google-services-key.json` locally (gitignored, never commit).
