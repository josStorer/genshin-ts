import type { Linter } from 'eslint'

import { luaLintRules, luaWarningRules } from '../compiler/lua/analysis/diagnostics.js'
import assignmentRestrictions from './rules/assignment-restrictions.js'
import builtinConsoleLogArity from './rules/builtin-console-log-arity.js'
import builtinMathSupport from './rules/builtin-math-support.js'
import builtinWrapperArity from './rules/builtin-wrapper-arity.js'
import clientFilterReturn from './rules/client-filter-return.js'
import clientGraphScopedF from './rules/client-graph-scoped-f.js'
import clientLiteralArguments from './rules/client-literal-arguments.js'
import clientLocalVariableSupport from './rules/client-local-variable-support.js'
import { luaRule } from './rules/client-lua.js'
import clientRepeatedEvaluation from './rules/client-repeated-evaluation.js'
import clientScopedGlobals from './rules/client-scoped-globals.js'
import clientSyntaxCapabilities from './rules/client-syntax-capabilities.js'
import forStructure from './rules/for-structure.js'
import graphFunctionCallScope from './rules/graph-function-call-scope.js'
import graphFunctionParameters from './rules/graph-function-parameters.js'
import graphFunctionReturn from './rules/graph-function-return.js'
import graphFunctionTopLevel from './rules/graph-function-top-level.js'
import gstsFunctionPrefix from './rules/gsts-function-prefix.js'
import listCallbackReturn from './rules/list-callback-return.js'
import listCallbackSignature from './rules/list-callback-signature.js'
import listMethodTypeConstraints from './rules/list-method-type-constraints.js'
import listMethodUsage from './rules/list-method-usage.js'
import listTypeAnnotation from './rules/list-type-annotation.js'
import luaModulo from './rules/lua-modulo.js'
import noConditionalVariableAssignment from './rules/no-conditional-variable-assignment.js'
import noGraphFunctionRecursion from './rules/no-graph-function-recursion.js'
import noGstsFOutsideServer from './rules/no-gsts-f-outside-server.js'
import noInnerDeclarations from './rules/no-inner-declarations.js'
import noJson from './rules/no-json.js'
import noNullishCoalesce from './rules/no-nullish-coalesce.js'
import noObjectStatic from './rules/no-object-static.js'
import noOuterGraphAssignment from './rules/no-outer-graph-assignment.js'
import noPlainObject from './rules/no-plain-object.js'
import noPromise from './rules/no-promise.js'
import noSpreadArrayWithoutType from './rules/no-spread-array-without-type.js'
import noStringOps from './rules/no-string-ops.js'
import noTimerInLoop from './rules/no-timer-in-loop.js'
import noUndefinedArrayReturn from './rules/no-undefined-array-return.js'
import noUnsupportedStatement from './rules/no-unsupported-statement.js'
import noWhileTrue from './rules/no-while-true.js'
import preferBigint from './rules/prefer-bigint.js'
import preferConstOutsideServer from './rules/prefer-const-outside-server.js'
import requireBigintIndexWrapper from './rules/require-bigint-index-wrapper.js'
import requireBooleanCondition from './rules/require-boolean-condition.js'
import serverLiteralArguments from './rules/server-literal-arguments.js'
import switchRestrictions from './rules/switch-restrictions.js'
import ternaryBranchType from './rules/ternary-branch-type.js'
import timerCallbackSignature from './rules/timer-callback-signature.js'
import timerIntervalFrequency from './rules/timer-interval-frequency.js'
import timerOuterCapture from './rules/timer-outer-capture.js'
import unsupportedBinaryOperator from './rules/unsupported-binary-operator.js'

export const rules = {
  'lua-modulo': luaModulo,
  ...Object.fromEntries(luaLintRules.map((name) => [name, luaRule(name)])),
  'assignment-restrictions': assignmentRestrictions,
  'builtin-console-log-arity': builtinConsoleLogArity,
  'builtin-math-support': builtinMathSupport,
  'builtin-wrapper-arity': builtinWrapperArity,
  'client-filter-return': clientFilterReturn,
  'client-graph-scoped-f': clientGraphScopedF,
  'client-literal-arguments': clientLiteralArguments,
  'client-local-variable-support': clientLocalVariableSupport,
  'client-repeated-evaluation': clientRepeatedEvaluation,
  'client-scoped-globals': clientScopedGlobals,
  'client-syntax-capabilities': clientSyntaxCapabilities,
  'for-structure': forStructure,
  'graph-function-call-scope': graphFunctionCallScope,
  'graph-function-parameters': graphFunctionParameters,
  'graph-function-return': graphFunctionReturn,
  'graph-function-top-level': graphFunctionTopLevel,
  'gsts-function-prefix': gstsFunctionPrefix,
  'list-callback-return': listCallbackReturn,
  'list-callback-signature': listCallbackSignature,
  'list-method-type-constraints': listMethodTypeConstraints,
  'list-method-usage': listMethodUsage,
  'list-type-annotation': listTypeAnnotation,
  'no-gsts-f-outside-server': noGstsFOutsideServer,
  'no-conditional-variable-assignment': noConditionalVariableAssignment,
  'no-graph-function-recursion': noGraphFunctionRecursion,
  'no-inner-declarations': noInnerDeclarations,
  'no-json': noJson,
  'no-nullish-coalesce': noNullishCoalesce,
  'no-object-static': noObjectStatic,
  'no-outer-graph-assignment': noOuterGraphAssignment,
  'no-plain-object': noPlainObject,
  'no-promise': noPromise,
  'no-spread-array-without-type': noSpreadArrayWithoutType,
  'no-string-ops': noStringOps,
  'no-timer-in-loop': noTimerInLoop,
  'no-unsupported-statement': noUnsupportedStatement,
  'no-undefined-array-return': noUndefinedArrayReturn,
  'no-while-true': noWhileTrue,
  'prefer-bigint': preferBigint,
  'prefer-const-outside-server': preferConstOutsideServer,
  'require-bigint-index-wrapper': requireBigintIndexWrapper,
  'require-boolean-condition': requireBooleanCondition,
  'server-literal-arguments': serverLiteralArguments,
  'switch-restrictions': switchRestrictions,
  'ternary-branch-type': ternaryBranchType,
  'timer-callback-signature': timerCallbackSignature,
  'timer-interval-frequency': timerIntervalFrequency,
  'timer-outer-capture': timerOuterCapture,
  'unsupported-binary-operator': unsupportedBinaryOperator
}

export const configs = {
  lua: {
    rules: {
      ...Object.fromEntries(Object.keys(rules).map((name) => [`gsts/${name}`, 'off' as const])),
      ...Object.fromEntries(
        luaLintRules.map((name) => [
          `gsts/${name}`,
          luaWarningRules.includes(name) ? ('warn' as const) : ('error' as const)
        ])
      ),
      'gsts/lua-modulo': 'warn' as const,
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableString: false,
          allowNullableNumber: false
        }
      ] as const,
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=null]',
          message: 'Use undefined in Lua code; null and undefined both become nil.'
        }
      ] as const
    }
  },
  recommended: {
    plugins: ['gsts'],
    rules: {
      'gsts/no-undefined-array-return': 'warn',
      'gsts/lua-shared-module': 'error',
      'gsts/no-object-static': 'warn',
      'gsts/no-outer-graph-assignment': 'warn',
      'gsts/no-conditional-variable-assignment': 'warn',
      'gsts/no-plain-object': 'warn',
      'gsts/require-boolean-condition': 'warn',
      'gsts/no-timer-in-loop': 'warn',
      'gsts/no-graph-function-recursion': 'error',
      'gsts/no-promise': 'warn',
      'gsts/no-json': 'warn',
      'gsts/no-string-ops': 'error',
      'gsts/no-while-true': 'warn',
      'gsts/prefer-bigint': 'warn',
      'gsts/graph-function-top-level': 'error',
      'gsts/graph-function-parameters': 'error',
      'gsts/graph-function-return': 'error',
      'gsts/graph-function-call-scope': 'error',
      'gsts/no-gsts-f-outside-server': 'error',
      'gsts/prefer-const-outside-server': 'error',
      'gsts/no-unsupported-statement': 'error',
      'gsts/no-inner-declarations': 'error',
      'gsts/switch-restrictions': 'error',
      'gsts/for-structure': 'error',
      'gsts/gsts-function-prefix': 'error',
      'gsts/no-nullish-coalesce': 'error',
      'gsts/assignment-restrictions': 'error',
      'gsts/require-bigint-index-wrapper': 'warn',
      'gsts/unsupported-binary-operator': 'error',
      'gsts/ternary-branch-type': 'error',
      'gsts/no-spread-array-without-type': 'error',
      'gsts/list-type-annotation': 'error',
      'gsts/list-method-usage': 'error',
      'gsts/list-callback-signature': 'error',
      'gsts/list-callback-return': 'error',
      'gsts/list-method-type-constraints': 'error',
      'gsts/timer-callback-signature': 'error',
      'gsts/timer-interval-frequency': 'warn',
      'gsts/timer-outer-capture': ['warn', { allowOuterEventParam: false }],
      'gsts/builtin-math-support': 'error',
      'gsts/builtin-console-log-arity': 'error',
      'gsts/builtin-wrapper-arity': 'error',
      'gsts/client-filter-return': 'error',
      'gsts/client-graph-scoped-f': 'error',
      'gsts/client-literal-arguments': 'error',
      'gsts/server-literal-arguments': 'error',
      'gsts/client-local-variable-support': 'error',
      'gsts/client-repeated-evaluation': 'warn',
      'gsts/client-scoped-globals': 'error',
      'gsts/client-syntax-capabilities': 'error'
    } satisfies Linter.RulesRecord
  }
}

export default {
  rules,
  configs
}
