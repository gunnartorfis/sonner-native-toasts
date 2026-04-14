import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const flatConfigs = (reactHooks as Record<string, unknown>).configs as
  | Record<string, Record<string, unknown>>
  | undefined;
const flatRecommended = flatConfigs?.flat?.recommended;

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
  ]),
  tseslint.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(flatRecommended ? [flatRecommended as any] : []),
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
