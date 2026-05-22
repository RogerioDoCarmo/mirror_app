/** @type {import('jest-expo/jest-preset').JestPreset} */
const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  // pnpm resolves packages to their real path under .pnpm/ — adding `.pnpm`
  // to the exception list lets Jest see through that nesting and apply the
  // normal package-name exceptions at the second node_modules/ level.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?(/.*)?|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-camera|expo-localization))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
    '!src/**/*.stories.{ts,tsx}',
    // core/domain and core/ports contain only TypeScript type declarations —
    // they are erased at compile time and have no runtime code to cover.
    '!src/core/**',
    // Translation map files are pure data objects — coverage is meaningless.
    '!src/i18n/translations/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  // Exclude Stryker's sandbox copies — they are managed by Stryker and should
  // never be picked up by regular Jest runs.
  testPathIgnorePatterns: ['/node_modules/', '/.stryker-tmp/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;
