import assignmentRestrictions from './rules/assignment-restrictions.js'
import builtinConsoleLogArity from './rules/builtin-console-log-arity.js'
import builtinMathSupport from './rules/builtin-math-support.js'
import builtinWrapperArity from './rules/builtin-wrapper-arity.js'
import forStructure from './rules/for-structure.js'
import gstsserverCallScope from './rules/gstsserver-call-scope.js'
import gstsserverParams from './rules/gstsserver-params.js'
import gstsserverReturn from './rules/gstsserver-return.js'
import gstsserverTopLevel from './rules/gstsserver-top-level.js'
import listCallbackReturn from './rules/list-callback-return.js'
import listCallbackSignature from './rules/list-callback-signature.js'
import listMethodTypeConstraints from './rules/list-method-type-constraints.js'
import listMethodUsage from './rules/list-method-usage.js'
import listTypeAnnotation from './rules/list-type-annotation.js'
import noGstsFOutsideServer from './rules/no-gsts-f-outside-server.js'
import noGstsServerRecursion from './rules/no-gstsserver-recursion.js'
import noInnerDeclarations from './rules/no-inner-declarations.js'
import noJson from './rules/no-json.js'
import noNullishCoalesce from './rules/no-nullish-coalesce.js'
import noObjectStatic from './rules/no-object-static.js'
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
import requireBooleanCondition from './rules/require-boolean-condition.js'
import switchRestrictions from './rules/switch-restrictions.js'
import ternaryBranchType from './rules/ternary-branch-type.js'
import timerCallbackSignature from './rules/timer-callback-signature.js'
import timerIntervalFrequency from './rules/timer-interval-frequency.js'
import timerOuterCapture from './rules/timer-outer-capture.js'
import unsupportedBinaryOperator from './rules/unsupported-binary-operator.js'

export const rules = {
  'assignment-restrictions': assignmentRestrictions,
  'builtin-console-log-arity': builtinConsoleLogArity,
  'builtin-math-support': builtinMathSupport,
  'builtin-wrapper-arity': builtinWrapperArity,
  'for-structure': forStructure,
  'gstsserver-call-scope': gstsserverCallScope,
  'gstsserver-params': gstsserverParams,
  'gstsserver-return': gstsserverReturn,
  'gstsserver-top-level': gstsserverTopLevel,
  'list-callback-return': listCallbackReturn,
  'list-callback-signature': listCallbackSignature,
  'list-method-type-constraints': listMethodTypeConstraints,
  'list-method-usage': listMethodUsage,
  'list-type-annotation': listTypeAnnotation,
  'no-gsts-f-outside-server': noGstsFOutsideServer,
  'no-gstsserver-recursion': noGstsServerRecursion,
  'no-inner-declarations': noInnerDeclarations,
  'no-json': noJson,
  'no-nullish-coalesce': noNullishCoalesce,
  'no-object-static': noObjectStatic,
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
  'require-boolean-condition': requireBooleanCondition,
  'switch-restrictions': switchRestrictions,
  'ternary-branch-type': ternaryBranchType,
  'timer-callback-signature': timerCallbackSignature,
  'timer-interval-frequency': timerIntervalFrequency,
  'timer-outer-capture': timerOuterCapture,
  'unsupported-binary-operator': unsupportedBinaryOperator
}

export const configs = {
  recommended: {
    plugins: ['gsts'],
    rules: {
      'gsts/no-undefined-array-return': 'warn',
      'gsts/no-object-static': 'warn',
      'gsts/no-plain-object': 'warn',
      'gsts/require-boolean-condition': 'warn',
      'gsts/no-timer-in-loop': 'warn',
      'gsts/no-gstsserver-recursion': 'error',
      'gsts/no-promise': 'warn',
      'gsts/no-json': 'warn',
      'gsts/no-string-ops': 'error',
      'gsts/no-while-true': 'warn',
      'gsts/prefer-bigint': 'warn',
      'gsts/gstsserver-top-level': 'error',
      'gsts/gstsserver-params': 'error',
      'gsts/gstsserver-return': 'error',
      'gsts/gstsserver-call-scope': 'error',
      'gsts/no-gsts-f-outside-server': 'error',
      'gsts/prefer-const-outside-server': 'error',
      'gsts/no-unsupported-statement': 'error',
      'gsts/no-inner-declarations': 'error',
      'gsts/switch-restrictions': 'error',
      'gsts/for-structure': 'error',
      'gsts/no-nullish-coalesce': 'error',
      'gsts/assignment-restrictions': 'error',
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
      'gsts/builtin-wrapper-arity': 'error'
    }
  }
}

export default {
  rules,
  configs
}
