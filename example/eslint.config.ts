import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const flatConfigs = (reactHooks.configs as Record<string, unknown>).flat as Record<string, unknown> | undefined;
if (!flatConfigs?.recommended) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flatConfigs.recommended as any,
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
