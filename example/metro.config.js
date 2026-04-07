/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = withMetroConfig(defaultConfig, {
  root,
  dirname: __dirname,
});

// Merge Expo's default watchFolders that withMetroConfig overwrites
config.watchFolders = [
  ...new Set([...(config.watchFolders || []), ...(defaultConfig.watchFolders || [])]),
];

config.resolver.unstable_enablePackageExports = true;

delete config.watcher.unstable_workerThreads;

module.exports = config;
