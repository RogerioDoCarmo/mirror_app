const typescriptEslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jestPlugin = require('eslint-plugin-jest');
const testingLibraryPlugin = require('eslint-plugin-testing-library');
const jsdocPlugin = require('eslint-plugin-jsdoc');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('typescript-eslint').Config} */
module.exports = typescriptEslint.config(
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'coverage/**',
      '.stryker-tmp/**',
      'reports/**',
      'eslint.config.js',
      'jest.config.js',
      'stryker.config.json',
      'metro.config.js',
      'babel.config.js',
      '.rnstorybook/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...typescriptEslint.configs.recommended,
      ...typescriptEslint.configs.strictTypeChecked,
    ],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      jsdoc: jsdocPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ── JSDoc ────────────────────────────────────────────────────────────
      // Require a JSDoc block on every exported function, class, and type.
      // We target TypeScript mode so @param/@returns types are never required
      // (the TS signature already carries that information).
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
            MethodDefinition: false,
            ClassDeclaration: true,
          },
          contexts: [
            'ExportNamedDeclaration > TSTypeAliasDeclaration',
            'ExportNamedDeclaration > TSInterfaceDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': ['error', { descriptionStyle: 'body' }],
      'jsdoc/require-description-complete-sentence': 'error',
      'jsdoc/check-tag-names': ['error', { typed: true }],
      'jsdoc/no-undefined-types': 'off', // covered by TypeScript itself
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/*.stories.{ts,tsx}'],
    plugins: {
      jest: jestPlugin,
      'testing-library': testingLibraryPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      ...testingLibraryPlugin.configs.react.rules,
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // jest.mock() factories must use require() — static imports can't be hoisted inside them
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  prettierConfig,
);
