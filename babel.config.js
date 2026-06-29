module.exports = {
  overrides: [
    {
      exclude: /\/node_modules\//,
      presets: ['module:react-native-builder-bob/babel-preset'],
    },
    {
      include: /\/node_modules\//,
      presets: [
        // Pin enableBabelRuntime so Babel helpers are imported once from
        // @babel/runtime instead of duplicated per file (smaller JS bundle).
        [
          'module:@react-native/babel-preset',
          { enableBabelRuntime: '^7.29.0' },
        ],
      ],
    },
  ],
};
