import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist', 'node_modules', 'functions/lib', '*.config.js', '*.config.ts', '**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node globals for NodeJS.Timeout etc
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Disable problematic rules
      'no-undef': 'off', // TypeScript handles this better
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off', // Too strict, has false positives
      'react-refresh/only-export-components': 'off', // Too strict for utility files
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_', 
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test mocks
      'no-console': 'off', // We have logger utility, scanned separately
    },
  },
];

