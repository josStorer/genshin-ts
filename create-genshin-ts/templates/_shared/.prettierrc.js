export default {
  singleQuote: true,
  semi: false,
  printWidth: 100,
  trailingComma: 'none',
  endOfLine: 'lf',
  tabWidth: 2,
  importOrder: ['', '<BUILTIN_MODULES>', '', '<THIRD_PARTY_MODULES>', '', '^[./]'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  plugins: ['@ianvs/prettier-plugin-sort-imports']
}
