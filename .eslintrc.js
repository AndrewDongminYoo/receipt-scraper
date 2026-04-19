module.exports = {
  root: true,

  env: {
    es2022: true,
    node: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended',
    'prettier',
  ],

  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'unused-imports',
  ],

  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  ignorePatterns: [
    'node_modules/',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'coverage/',
    'dist/',
    'build/',
    'android/',
    'ios/',
    '*.generated.*',
  ],

  rules: {
    /**
     * -------------------------
     * General
     * -------------------------
     */
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',

    /**
     * -------------------------
     * TypeScript
     * -------------------------
     */
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

    /**
     * -------------------------
     * React / React Native
     * -------------------------
     */
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',

    // 컴포넌트 선언 방식 통일
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: ['function-expression', 'arrow-function'],
      },
    ],

    /**
     * -------------------------
     * Hooks
     * -------------------------
     */
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /**
     * -------------------------
     * Imports
     * -------------------------
     */
    'sort-imports': 'off',
    'import/order': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // React / RN
          ['^react$', '^react-native$'],
          // Third-party packages
          ['^@?\\w'],
          // Internal aliases
          [
            '^(@|src/|components/|screens/|hooks/|utils/|services/|store/|assets/|theme/|types/)',
          ],
          // Parent imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Same-folder imports
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Side effect imports
          ['^\\u0000'],
          // Style imports
          ['^.+\\.s?css$', '^.+\\.less$', '^.+\\.styl$', '^.+\\.json$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off',

    /**
     * unused imports는 전용 플러그인으로 정리
     */
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

  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:jest/recommended'],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/valid-expect': 'error',
        'no-console': 'off',
      },
    },
    {
      files: [
        'test/**/*.js',
        'test/**/*.ts',
        'test/**/*.tsx',
        'tests/**/*.js',
        'tests/**/*.ts',
        'tests/**/*.tsx',
        '**/*.mocha.[jt]s',
      ],
      extends: ['plugin:mocha/recommended'],
      plugins: ['mocha'],
      env: {
        mocha: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: [
        '*.config.js',
        '*.config.cjs',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
      ],
      env: {
        node: true,
      },
    },
  ],
};
