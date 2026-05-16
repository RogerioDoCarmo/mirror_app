# MirrorApp

A React Native application that uses the front-facing camera to display a real-time mirror view.

The app's functionality is intentionally simple. The focus of this project is **engineering quality**: every decision — from folder structure to CI/CD — follows professional-grade standards that reflect how production mobile applications are built and shipped.

---

## Motivation

This project serves as a portfolio piece to demonstrate mobile development best practices in a public, auditable codebase. It covers the full lifecycle of a mobile app: local development, automated quality gates, and deployment to both the Apple App Store and Google Play.

---

## Tech Stack

| Layer           | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | [Expo](https://expo.dev) SDK 54 (Managed Workflow) |
| Language        | TypeScript 5.9 — strict mode                       |
| UI              | React Native 0.81 + New Architecture               |
| Camera          | expo-camera v17                                    |
| Package manager | pnpm                                               |

---

## Quality Goals

This project enforces measurable quality standards at every stage of development.

### Test-Driven Development

All production code is written following the **Red → Green → Refactor** cycle:

1. Write a failing test that describes the expected behaviour
2. Write the minimum code needed to make it pass
3. Refactor without breaking the tests

No implementation file exists without a corresponding test file written first.

### Test Coverage

| Layer              | Tool                                   |
| ------------------ | -------------------------------------- |
| Unit & Integration | Jest 29 + React Native Testing Library |
| Mutation           | Stryker                                |
| End-to-End         | Maestro                                |

**Coverage threshold: 80%** across statements, branches, functions, and lines — enforced on every commit via a pre-commit hook. Commits are rejected if coverage drops below this threshold.

**Mutation score threshold: 60% (break) / 80% (target)** — Stryker verifies that tests are actually sensitive to code changes, not just present.

### Static Analysis

| Tool                    | Purpose                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| ESLint v9 (flat config) | Linting — typescript-eslint strict rules, react-hooks, testing-library, jest            |
| Prettier                | Consistent formatting across the entire codebase                                        |
| TypeScript strict       | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns` |

### Git Hooks

Husky runs the following checks on every `git commit`, blocking the commit if any step fails:

1. **lint-staged** — ESLint + Prettier on staged files only
2. **jest --coverage** — full test suite with coverage threshold enforcement

---

## Project Structure

```
src/
├── components/
│   └── PermissionGate/       # Handles loading / denied / blocked / granted camera permission states
├── screens/
│   └── MirrorScreen/         # Front-facing camera rendered in mirror mode
├── hooks/
│   └── useCamera/            # Encapsulates expo-camera permission lifecycle and camera ref
└── types/                    # Shared TypeScript types

.github/workflows/
├── ci.yml                    # Lint + typecheck + unit tests + mutation tests (on every PR)
├── e2e.yml                   # Maestro flows on iOS simulator and Android emulator
└── eas-build.yml             # EAS build + store submission (on push to main)

.maestro/flows/               # End-to-end test flows (YAML)
```

---

## Branching Strategy — Git Flow

| Branch      | Purpose                                                                                |
| ----------- | -------------------------------------------------------------------------------------- |
| `main`      | Production-ready code. Protected. Only receives merges from `release/*` or `hotfix/*`. |
| `develop`   | Integration branch. All feature branches merge here.                                   |
| `feature/*` | One branch per feature or task, branched from `develop`.                               |
| `release/*` | Branched from `develop` when preparing a store release.                                |
| `hotfix/*`  | Branched from `main` for critical production fixes.                                    |

---

## CI/CD Pipeline

Every pull request into `develop` or `main` triggers the CI workflow:

```
Lint → Typecheck → Unit/Integration Tests → Mutation Tests
```

Pull requests into `main` additionally trigger E2E tests on both platforms.

Pushing to `main` triggers an EAS production build and automatic submission to both stores.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for builds and store submission)
- [Maestro CLI](https://maestro.mobile.dev) (for E2E tests)

### Install

```bash
pnpm install
```

### Run

```bash
pnpm ios       # iOS simulator
pnpm android   # Android emulator
```

---

## Available Scripts

| Script               | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `pnpm test`          | Run unit and integration tests                              |
| `pnpm test:coverage` | Run tests with coverage report (enforces 80% threshold)     |
| `pnpm test:watch`    | Run tests in watch mode                                     |
| `pnpm test:e2e`      | Run Maestro E2E flows (requires a running simulator/device) |
| `pnpm mutation`      | Run Stryker mutation tests                                  |
| `pnpm lint`          | Run ESLint                                                  |
| `pnpm lint:fix`      | Run ESLint with auto-fix                                    |
| `pnpm format`        | Run Prettier on all files                                   |
| `pnpm typecheck`     | Run TypeScript type checking                                |

---

## License

[MIT](LICENSE) © 2026 Rogério Ramos Rodrigues do Carmo
