const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');
const parser = require('@typescript-eslint/parser');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const tsLint = require('@typescript-eslint/eslint-plugin');
const _import = require('eslint-plugin-import');
const simple = require('eslint-plugin-simple-import-sort');
const unused = require('eslint-plugin-unused-imports');
const jest = require('eslint-plugin-jest');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: parser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        '@react-native',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
      ),
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(tsLint),
      import: fixupPluginRules(_import),
      'simple-import-sort': simple,
      'unused-imports': unused,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-debugger': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',

      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 5,
        },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/require-default-props': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',

      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: ['function-expression', 'arrow-function'],
        },
      ],

      'sort-imports': 'off',
      'import/order': 'off',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^(?:\\u0000)?.+\\.(css|scss|sass|less|stylus)(?:\\?.*)?$'],
            ['^react$', '^react-native$'],
            ['^@?\\w'],
            [
              '^(@|src/|components/|screens/|hooks/|utils/|services/|store/|assets/|theme/|types/)',
            ],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^\\u0000'],
            ['^.+\\.json$'],
          ],
        },
      ],

      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/named': 'off',
      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  globalIgnores([
    '**/node_modules/',
    '**/babel.config.js',
    '**/metro.config.js',
    '**/jest.config.js',
    '**/coverage/',
    '**/dist/',
    '**/build/',
    '**/android/',
    '**/ios/',
    '**/*.generated.*',
  ]),
  {
    files: ['**/*.js'],

    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    // extends: compat.extends('plugin:jest/recommended'),

    plugins: {
      // jest,
    },

    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },

    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
      'no-console': 'off',
    },
  },
  globalIgnores(['**/vendor/', '**/coverage/']),
]);
