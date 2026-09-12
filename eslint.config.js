import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'artifacts/**',
      'tmp/**',
      'supabase/**',
      'coverage/**',
      'public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript's compiler already reports unresolvable identifiers.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', args: 'after-used' },
      ],
      // Legacy surfaces (Supabase row typing, upstream response shapes) still use
      // `any`; tracked as warnings until they are typed in a dedicated pass.
      '@typescript-eslint/no-explicit-any': 'warn',
      // react-hooks v7 opinionated rule; several intentional init-from-storage
      // effects trigger it. Kept visible but non-blocking until reviewed.
      'react-hooks/set-state-in-effect': 'warn',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'smart'],
      'no-var': 'error',
      'object-shorthand': ['error', 'properties'],
      'prefer-template': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
