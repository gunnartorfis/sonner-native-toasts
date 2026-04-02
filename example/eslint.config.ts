import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

if (!reactHooks.configs.flat.recommended) {
  throw new Error('reactHooks.configs.flat.recommended is not defined');
}

export default defineConfig([
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
    '.expo/**',
    'babel.config.js',
    'metro.config.js',
    'tailwind.config.js',
  ]),
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
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
]);
