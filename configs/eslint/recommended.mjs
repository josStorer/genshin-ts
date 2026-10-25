import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import gsts from 'genshin-ts/eslint'
import { gstsDslGlobals } from 'genshin-ts/eslint.globals.mjs'

import { isLuaProjectFile } from './lua_project.mjs'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: true
      },
      globals: {
        ...gstsDslGlobals
      }
    },
    plugins: {
      gsts
    },
    rules: {
      ...gsts.configs.recommended.rules,
      'prefer-const': 'off'
    }
  },

  // Lua 子项目自动使用 Lua 规则（与 full.mjs 相同）；预设同时关闭节点图专用规则。
  {
    files: [isLuaProjectFile],
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: gsts.configs.lua.rules
  }
]
