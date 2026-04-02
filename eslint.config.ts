import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

if (!reactHooks.configs.flat.recommended) {
  throw new Error('reactHooks.configs.flat.recommended is not defined');
}

/**
 * This configuration uses the new flat config format and includes:
 * - TypeScript ESLint for type-aware linting
 * - React Hooks plugin for React best practices
 * - Separate handling for TypeScript and JavaScript files
 */
export default defineConfig([
  // Global ignore patterns - these directories/files are completely excluded from linting
  globalIgnores([
    'node_modules/**',
    'ios/**',
    'android/**',
    'lib/**',
    '.yarn/**',
    '.vscode/**',
    '.github/**',
    '.git/**',
    'docs/**',
    'example/**',
  ]),

  // Base TypeScript ESLint recommended rules for all files
  tseslint.configs.recommended,

  // React Hooks plugin recommended rules for all files
  reactHooks.configs.flat.recommended,

  /**
   * TypeScript-specific configuration
   *
   * Only applies to .ts and .tsx files to enable type-aware linting.
   * The parserOptions.project setting is required for rules that need type information,
   * but it should only be applied to TypeScript files to avoid errors with JS files
   * like babel.config.js that aren't part of the TypeScript project.
   */
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },

  /**
   * JavaScript-specific configuration
   *
   * Applies to .js and .jsx files without TypeScript parser settings.
   * This prevents errors when linting JavaScript config files (like babel.config.js)
   * that aren't included in the TypeScript project.
   */
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
    },
  },
]);
