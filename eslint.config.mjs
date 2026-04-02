import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextConfig from 'eslint-config-next'

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', '.velite/**', 'coverage/**'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Next.js rules (includes React, hooks, core-web-vitals)
  ...nextConfig,

  // Global settings for all TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Pragmatic: warn instead of error for common patterns
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Allow @ts-ignore with a description — velite config needs it
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        { 'ts-ignore': 'allow-with-description' },
      ],
      // setState in effects is valid for hydrating from localStorage
      'react-hooks/set-state-in-effect': 'warn',
      // Incompatible library warnings are informational
      'react-hooks/incompatible-library': 'warn',
    },
  },

  // JS/CJS files need node globals
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
  },

  // Test files get relaxed rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
