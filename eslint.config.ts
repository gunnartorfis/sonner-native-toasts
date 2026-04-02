import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

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
      // Intentional imperative API pattern — module-level handlers assigned during render
      'react-hooks/globals': 'off',
      // Ref mutations are intentional (toastsCounter.current)
      'react-hooks/immutability': 'off',
    },
  },
]);
