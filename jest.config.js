/** @type {import('jest-expo/jest-preset').JestPreset} */
const config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  // pnpm resolves packages to their real path under .pnpm/ — adding `.pnpm`
  // to the exception list lets Jest see through that nesting and apply the
  // normal package-name exceptions at the second node_modules/ level.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?(/.*)?|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-camera))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = config;
