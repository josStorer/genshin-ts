import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'

import gsts from './dist/src/eslint/index.js'
import { gstsDslGlobals } from './eslint.globals.mjs'

export default [
  {
    ignores: ['dist/**', 'out/**', 'node_modules/**', '*.config.js', '.vscode/**']
  },

  eslint.configs.recommended,

  // TypeScript 文件配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        ...gstsDslGlobals
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      gsts
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...gsts.configs.recommended.rules,
      'gsts/no-gsts-f-outside-server': 'off',

      // 代码质量规则
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',

      // this 安全规则
      '@typescript-eslint/no-this-alias': ['error'],
      '@typescript-eslint/unbound-method': ['error'],
      'no-invalid-this': 'off', // 关闭基础规则
      '@typescript-eslint/no-invalid-this': 'error', // 使用 TS 版本
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',

      // 通用规则
      'no-console': 'off',
      'no-debugger': 'warn',
      'prefer-const': 'off',
      'no-var': 'error',

      // Prettier 集成
      ...prettierConfig.rules,
      'prettier/prettier': 'error'
    }
  },

  // Lua 全局声明有独立类型环境，不能为了 lint 混进节点图工程。
  {
    files: ['src/runtime/lua_globals.d.ts'],
    languageOptions: { parserOptions: { project: './tests/lua/tsconfig.sdk.json' } }
  },

  // JavaScript 文件配置（如配置文件等）
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    plugins: {
      prettier: prettier
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error'
    }
  }
]
