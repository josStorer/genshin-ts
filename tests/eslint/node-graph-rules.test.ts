import assert from 'node:assert/strict'
import path from 'node:path'

import parser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'

import { configs, rules } from '../../src/eslint/index.js'
import builtinMathSupport from '../../src/eslint/rules/builtin-math-support.js'
import builtinWrapperArity from '../../src/eslint/rules/builtin-wrapper-arity.js'
import clientFilterReturn from '../../src/eslint/rules/client-filter-return.js'
import clientGraphScopedF from '../../src/eslint/rules/client-graph-scoped-f.js'
import clientLiteralArguments from '../../src/eslint/rules/client-literal-arguments.js'
import clientLocalVariableSupport from '../../src/eslint/rules/client-local-variable-support.js'
import clientRepeatedEvaluation from '../../src/eslint/rules/client-repeated-evaluation.js'
import clientScopedGlobals from '../../src/eslint/rules/client-scoped-globals.js'
import clientSyntaxCapabilities from '../../src/eslint/rules/client-syntax-capabilities.js'
import graphFunctionCallScope from '../../src/eslint/rules/graph-function-call-scope.js'
import graphFunctionParameters from '../../src/eslint/rules/graph-function-parameters.js'
import graphFunctionReturn from '../../src/eslint/rules/graph-function-return.js'
import graphFunctionTopLevel from '../../src/eslint/rules/graph-function-top-level.js'
import gstsFunctionPrefix from '../../src/eslint/rules/gsts-function-prefix.js'
import listMethodTypeConstraints from '../../src/eslint/rules/list-method-type-constraints.js'
import noGraphFunctionRecursion from '../../src/eslint/rules/no-graph-function-recursion.js'
import noJson from '../../src/eslint/rules/no-json.js'
import serverLiteralArguments from '../../src/eslint/rules/server-literal-arguments.js'
import switchRestrictions from '../../src/eslint/rules/switch-restrictions.js'

const filename = path.join(process.cwd(), 'tests/eslint/node-graph-rules.test.ts')
const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: process.cwd(),
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
})

const importG = `import { g } from 'genshin-ts/runtime/core'`

assert.equal(configs.recommended.rules['gsts/client-local-variable-support'], 'error')
assert.equal(configs.recommended.rules['gsts/client-literal-arguments'], 'error')
assert.equal(configs.recommended.rules['gsts/server-literal-arguments'], 'error')
assert.equal(configs.recommended.rules['gsts/client-repeated-evaluation'], 'warn')

const renamedSharedRuleIds = [
  'no-graph-function-recursion',
  'graph-function-top-level',
  'graph-function-parameters',
  'graph-function-return',
  'graph-function-call-scope',
  'require-bigint-index-wrapper'
]
const removedServerRuleIds = [
  'no-gstsserver-recursion',
  'gstsserver-top-level',
  'gstsserver-params',
  'gstsserver-return',
  'gstsserver-call-scope',
  'bigint-index-in-server'
]

for (const ruleId of renamedSharedRuleIds) {
  assert.ok(Object.hasOwn(rules, ruleId), `missing renamed rule: ${ruleId}`)
  assert.ok(
    Object.hasOwn(configs.recommended.rules, `gsts/${ruleId}`),
    `missing recommended rule: gsts/${ruleId}`
  )
}
for (const ruleId of removedServerRuleIds) {
  assert.ok(!Object.hasOwn(rules, ruleId), `obsolete rule is still exported: ${ruleId}`)
  assert.ok(
    !Object.hasOwn(configs.recommended.rules, `gsts/${ruleId}`),
    `obsolete recommended rule still exists: gsts/${ruleId}`
  )
}

ruleTester.run('client-scoped-globals', clientScopedGlobals, {
  valid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {})
g.characterControlSkill().on('start', (_evt, _f) => {})
g.creationSkill().on('start', (_evt, _f) => {})
g.creationStatus().on('start1', (_evt, _f) => {})
g.creationStatusDecision().on('start1', (_evt, _f) => {})
g.boolFilter().on('start', (_evt, _f) => true)
g.intFilter().on('start', (_evt, _f) => 0n)`
    },
    {
      filename,
      code: `${importG}
const graph = g.creationSkill({ mode: 'classic' })
graph.on('start', (_evt, _f) => { self })`
    },
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', (_evt, _f) => {
  Mathf.FloorToInt(-1.5)
  Mathf.CeilToInt(1.5)
  Vector3.Distance(Vector3.zero, Vector3.one)
  Vector3.ClampMagnitude(Vector3.one, 1)
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => { setTimeout(() => {}, 1) })`,
      errors: [{ message: /setTimeout is not available in character_skill/ }]
    },
    {
      filename,
      code: `${importG}
const options = { mode: 'classic' } as const
const graph = g.creationSkill(options)
graph.on('start', (_evt, _f) => { setTimeout(() => {}, 1) })`,
      errors: [{ message: /setTimeout is not available in creation_skill/ }]
    },
    {
      filename,
      code: `${importG}
function gstsCreationSkillTimer() {
  setTimeout(() => {}, 1)
}`,
      errors: [{ message: /setTimeout is not available in creation_skill/ }]
    },
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', () => { print('client') })`,
      errors: [{ message: /print is not available in creation_skill/ }]
    },
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', () => { Mathf.RoundToInt(1.5) })`,
      errors: [{ message: /Mathf\.RoundToInt is not available in creation_skill/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', () => { Mathf.FloorToInt(-1.5) })`,
      errors: [{ message: /Mathf\.FloorToInt is not available in creation_status/ }]
    },
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', () => { console.log('client') })`,
      errors: [{ message: /console is not available in creation_skill/ }]
    },
    {
      filename,
      options: [{ lang: 'zh' }],
      code: `${importG}
g.creationSkill().on('start', () => { setTimeout(() => {}, 1) })`,
      errors: [{ message: /客户端 creation_skill 节点图中不可使用 setTimeout/ }]
    }
  ]
})

ruleTester.run('list-method-type-constraints', listMethodTypeConstraints, {
  valid: [
    {
      filename,
      code: `${importG}
g.server().on('update', (_evt, _f) => {
  const entities = list('entity', [entity(0)])
  entities.forEach((value) => { str(value) })
})`
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  const entities = list('entity', [entity(0)])
  entities.forEach((value) => { str(value) })
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.server().on('update', (_evt, _f) => {
  const entities = list('entity', [entity(0)])
  entities.find(() => false)
  entities.pop()
  entities.shift()
})`,
      errors: [
        { message: /find\(\) only supports list types/ },
        { message: /pop\(\) only supports list types/ },
        { message: /shift\(\) only supports list types/ }
      ]
    }
  ]
})

ruleTester.run('client-graph-scoped-f', clientGraphScopedF, {
  valid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  gsts.fCharacterSkill.printString('ok')
  globalThis.gsts.fCharacterSkill.printString('ok')
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  gsts.f.printString('bad')
  gsts.fServer.printString('bad')
})`,
      errors: [
        { message: /gsts\.f is a server namespace/ },
        { message: /gsts\.fServer is a server namespace/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  gsts.fBoolFilter.printString('bad')
})`,
      errors: [{ message: /belongs to bool_filter/ }]
    },
    {
      filename,
      code: `${importG}
gsts.fCharacterSkill.printString('bad')`,
      errors: [{ message: /only available inside a matching character_skill/ }]
    }
  ]
})

ruleTester.run('client-literal-arguments', clientLiteralArguments, {
  valid: [
    {
      filename,
      code: `${importG}
import { defineSignal } from '../../src/runtime/core'
import { RayFilterType, TargetEntity } from '../../src/definitions/client_enums'
const Signal = {
  typed: defineSignal('typed_signal', [])
}
g.creationStatus().on('start1', (_evt, f) => {
  f.getCustomVariable(TargetEntity.Self, 'score')
  f.queryEntityFaction(TargetEntity.Self)
  f.queryIfEntityIsOnTheField(TargetEntity.Self)
})
g.characterSkill().on('start', (_evt, f) => {
  const variableName = 'counter'
  const self = f.getSelfEntity()
  f.getLocalVariable(variableName)
  f.setLocalVariable('result', 1n)
  self.addUnitStatus(1n, 10001n)
  self.fixedPointProjectileLaunch(10001n, 1n, 10, self, 1n)
  f.getRayFilterTypeList([
    RayFilterType.Hurtbox,
    RayFilterType.Hurtbox,
    RayFilterType.Scene
  ])
  f.notifyServerNodeGraph('graph', '', '')
  f.sendSignalToServerNodeGraph(Signal.typed)
  send('global_signal')
})`
    },
    {
      filename,
      code: `${importG}
g.characterSkill({ lang: 'zh' }).on('start', (_evt, nodes) => {
  nodes.获取局部变量('counter')
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const dynamicName = str(f.addition(1n, 2n))
  f.getLocalVariable(dynamicName)
  f.setLocalVariable(dynamicName, 1n)
})`,
      errors: [
        { message: /Argument 1 of client method getLocalVariable must be a source literal/ },
        { message: /Argument 1 of client method setLocalVariable must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  const wiredTarget = f.getStageEntity()
  f.getCustomVariable(wiredTarget as never, 'score')
  f.queryEntityFaction(wiredTarget as never)
  f.queryIfEntityIsOnTheField(wiredTarget as never)
})`,
      errors: [
        { message: /Argument 1 of client method getCustomVariable must be a source literal/ },
        { message: /Argument 1 of client method queryEntityFaction must be a source literal/ },
        {
          message: /Argument 1 of client method queryIfEntityIsOnTheField must be a source literal/
        }
      ]
    },
    {
      filename,
      code: `${importG}
g.creationStatus({ lang: 'zh' }).on('start1', (_evt, nodes) => {
  const wiredTarget = nodes.getStageEntity()
  nodes.查询实体阵营(wiredTarget as never)
})`,
      errors: [
        { message: /Argument 1 of client method queryEntityFaction must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const wiredTypes = f.getRayFilterTypeList()
  f.getRayFilterTypeList(wiredTypes)
})`,
      errors: [
        { message: /Argument 1 of client method getRayFilterTypeList must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.characterSkill({ lang: 'zh' }).on('start', (_evt, f) => {
  const dynamicName = str(f.addition(1n, 2n))
  f.获取局部变量(dynamicName)
})`,
      errors: [{ message: /Argument 1 of client method getLocalVariable must be a source literal/ }]
    },
    {
      filename,
      code: `${importG}
g.characterControlSkill().on('start', (_evt, f) => {
  const dynamicGraphName = str(f.addition(1n, 2n))
  f.notifyServerNodeGraph(dynamicGraphName, '', '')
})`,
      errors: [
        { message: /Argument 1 of client method notifyServerNodeGraph must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const dynamicSignalName = str(f.addition(1n, 2n))
  f.sendSignalToServerNodeGraph(dynamicSignalName)
  send(dynamicSignalName)
})`,
      errors: [
        {
          message:
            /Argument 1 of client method sendSignalToServerNodeGraph must be a source literal/
        },
        {
          message:
            /Argument 1 of client method sendSignalToServerNodeGraph must be a source literal/
        }
      ]
    },
    {
      filename,
      code: `${importG}
function gstsCreationStatusLiteralCheck() {
  const wiredTarget = gsts.fCreationStatus.getStageEntity()
  gsts.fCreationStatus.getCustomVariable(wiredTarget as never, 'score')
}`,
      errors: [
        { message: /Argument 1 of client method getCustomVariable must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const self = f.getSelfEntity()
  const dynamicConfig = f.addition(1n, 2n)
  self.addUnitStatus(1n, dynamicConfig as never)
  self.fixedPointProjectileLaunch(dynamicConfig as never, 1n, 10, self, 1n)
})`,
      errors: [
        { message: /Argument 2 of client method addUnitStatus must be a source literal/ },
        {
          message: /Argument 1 of client method fixedPointProjectileLaunch must be a source literal/
        }
      ]
    }
  ]
})

ruleTester.run('server-literal-arguments', serverLiteralArguments, {
  valid: [
    {
      filename,
      code: `${importG}
import { defineSignal } from '../../src/runtime/core'
const S = defineSignal('LuaLiteral', [['value', 'int']])
g.server().on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getCorrespondingValueFromList(f.getListOfPlayerEntitiesOnTheField(), 0n)
  f.sendClientScriptedServerSignal(player, S, 1n)
  sendLua(player, S, 1n)
  sendLuaAll(S, 1n)
  player.sendLua('LuaLiteral', 1n)
})`
    },
    {
      filename,
      code: `${importG}
import type { PlayerEntity } from '../../src/definitions/entity_helpers'
g.server().on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity
  const maximumTargets = f.addition(1n, 2n)
  f.setPlayerSCursorClickSelectableTargets(player, 10n, maximumTargets)
  player.setPlayerSCursorClickSelectableTargets(11n, maximumTargets)
  const unrelated = {
    setPlayerSCursorClickSelectableTargets(_wired: bigint) {}
  }
  unrelated.setPlayerSCursorClickSelectableTargets(maximumTargets)
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.server().on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getCorrespondingValueFromList(f.getListOfPlayerEntitiesOnTheField(), 0n)
  const name = str(f.addition(1n, 2n))
  f.sendClientScriptedServerSignal(player, name)
  sendLua(player, name)
  sendLuaAll(name)
  player.sendLua(name)
})`,
      errors: [
        {
          message:
            /Argument 2 of server method sendClientScriptedServerSignal must be a source literal/
        },
        { message: /Argument 2 of server method sendLua must be a source literal/ },
        { message: /Argument 1 of server method sendLuaAll must be a source literal/ },
        { message: /Argument 1 of server method sendLua must be a source literal/ }
      ]
    },
    {
      filename,
      code: `${importG}
import type { PlayerEntity } from '../../src/definitions/entity_helpers'
g.server().on('whenEntityIsCreated', (_evt, f) => {
  const player = f.getSelfEntity() as unknown as PlayerEntity
  const wiredLayer = f.addition(1n, 2n)
  f.setPlayerSCursorClickSelectableTargets(player, wiredLayer as never, 1n)
  player.setPlayerSCursorClickSelectableTargets(wiredLayer as never, 1n)
})`,
      errors: [
        {
          message:
            /Argument 2 of server method setPlayerSCursorClickSelectableTargets must be a source literal/
        },
        {
          message:
            /Argument 1 of server method setPlayerSCursorClickSelectableTargets must be a source literal/
        }
      ]
    },
    {
      filename,
      code: `${importG}
import type { PlayerEntity } from '../../src/definitions/entity_helpers'
g.server({ lang: 'zh' }).on('实体创建时', (_evt, f) => {
  const player = f.获取自身实体() as unknown as PlayerEntity
  const wiredLayer = f.加法运算(1n, 2n)
  f.设置玩家光标点击可选取目标(player, wiredLayer as never, 1n)
})`,
      errors: [
        {
          message: /服务端方法 setPlayerSCursorClickSelectableTargets 的第 2 个参数仅支持字面量/
        }
      ]
    }
  ]
})

ruleTester.run('builtin-math-support client', builtinMathSupport, {
  valid: [
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', (_evt, _f) => {
  const values = [
    Math.abs(-1), Math.floor(-1.5), Math.ceil(1.5), Math.round(-1.5),
    Math.sin(1), Math.cos(1), Math.tan(1),
    Math.asin(1), Math.acos(1), Math.atan(1), Math.random(),
    Math.trunc(1.5), Math.min(1, 2), Math.max(1, 2), Math.hypot(3, 4),
    Math.sign(-1), Math.atan2(1, 1)
  ]
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationSkill().on('start', (_evt, _f) => { Math.sqrt(4) })`,
      errors: [{ message: /Math\.sqrt is not supported.*available methods: Math\.abs/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => { Math.floor(-1.5) })`,
      errors: [{ message: /Math\.floor is not supported.*creation_status/ }]
    }
  ]
})

ruleTester.run('builtin-wrapper-arity client conversions', builtinWrapperArity, {
  valid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', () => {
  bool(1n); int(1); float(1n); str(1n)
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', () => {
  int(); float(1, 2)
})`,
      errors: [
        { message: /int\(\) requires exactly one argument/ },
        { message: /float\(\) requires exactly one argument/ }
      ]
    }
  ]
})

ruleTester.run('client-filter-return', clientFilterReturn, {
  valid: [
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', (_evt, _f) => true)
g.intFilter().on('start', (_evt, _f) => 1n)`
    },
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', (_evt, _f) => {
  if (true) return true
  return false
})`
    },
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', function (_evt, _f) { return true })
g.intFilter().on('start', function namedIntFilter(_evt, _f) { return 1n })`
    },
    {
      filename,
      code: `
function gstsBoolFilterDeclaration() {}
const gstsBoolFilterExpression = function () {}
const gstsBoolFilterArrow = () => {}
function gstsClientIntFilterDeclaration() { return false }
const gstsIntFilterExpression = function () { return false }
const gstsClientIntFilterArrow = () => false`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', (_evt, _f) => {
  if (true) return true
})`,
      errors: [{ message: /All execution paths.*must return/ }]
    },
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', (_evt, _f) => 'bad')`,
      errors: [{ message: /must return a boolean\/bool compatible value/ }]
    },
    {
      filename,
      code: `${importG}
g.intFilter().on('start', (_evt, _f) => false)`,
      errors: [{ message: /must return a bigint\/number\/int compatible value/ }]
    },
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', function namedBoolFilter(_evt, _f) { return 'bad' })`,
      errors: [{ message: /must return a boolean\/bool compatible value/ }]
    }
  ]
})

ruleTester.run('client-local-variable-support', clientLocalVariableSupport, {
  valid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const ready = f.equal(1n, 1n)
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
  const result = ready ? 1n : 0n
  f.absoluteValueOperation(result)
})`
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  const ready = true
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
  const result = f.equal(1n, 1n) ? 1n : 0n
  f.absoluteValueOperation(result)
})
g.boolFilter().on('start', (_evt, f) => f.equal(1n, 1n) ? true : false)`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationStatusDecision().on('start1', (_evt, f) => {
  const result = f.equal(1n, 1n) ? 'yes' : 'no'
  f.equal(result, 'yes')
})`,
      errors: [{ message: /conditional expressions require a temporary local variable/ }]
    }
  ]
})

ruleTester.run('client-repeated-evaluation', clientRepeatedEvaluation, {
  valid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const roll = f.getRandomNumber(0n, 10n)
  f.absoluteValueOperation(roll)
  f.absoluteValueOperation(roll)
})
g.creationStatus().on('start1', (_evt, f) => {
  const ready = true
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
  const once = f.getRandomNumber(0n, 10n)
  f.absoluteValueOperation(once)
  while (f.equal(1n, 1n)) {
    const perIteration = f.getRandomNumber(0n, 10n)
    f.absoluteValueOperation(perIteration)
  }
})`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  const ready = f.equal(1n, 1n)
  if (ready) f.absoluteValueOperation(-1n)
  if (ready) f.absoluteValueOperation(-2n)
})`,
      errors: [
        {
          message:
            /Non-pure const "ready" has 2 read sites.*connections are reevaluated at every use.*random, query, or other time-varying nodes.*local-variable snapshot.*keeps direct node connections.*differ from the source-code semantics/
        }
      ]
    },
    {
      filename,
      options: [{ lang: 'zh' }],
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  const roll = f.getRandomNumber(0n, 10n)
  while (f.equal(1n, 1n)) {
    f.absoluteValueOperation(roll)
  }
})`,
      errors: [
        {
          message:
            /“roll”在声明所在循环之外的循环中读取.*节点图连线在每个使用点都会重新求值.*随机数、查询结果或其他时变节点.*保留直接节点连线.*因此这段代码逻辑你需要考虑变量重复求值的结果，会和实际代码语义有差异/
        }
      ]
    },
    {
      filename,
      code: `${importG}
function gstsCreationStatusNeedsLocal() {
  const ready = gsts.fCreationStatus.equal(1n, 1n)
  if (ready) gsts.fCreationStatus.absoluteValueOperation(-1n)
  if (ready) gsts.fCreationStatus.absoluteValueOperation(-2n)
}`,
      errors: [{ message: /Non-pure const "ready" has 2 read sites.*local-variable snapshot/ }]
    }
  ]
})

ruleTester.run('switch-restrictions client capabilities', switchRestrictions, {
  valid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => {
  switch (1n) {
    case 1n:
      break
    default:
      break
  }
})`
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  switch (1n) {
    case 1n:
      break
    default:
      break
  }
})
g.creationSkill().on('start', (_evt, _f) => {
  switch (1n) {
    case 1n:
      break
    default:
      break
  }
})
`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.boolFilter().on('start', (_evt, _f) => {
  switch (1n) {
    case 1n:
      return true
    default:
      return false
  }
})`,
      errors: [{ message: /Client bool_filter graphs do not support switch/ }]
    },
    {
      filename,
      code: `${importG}
g.intFilter().on('start', (_evt, _f) => {
  switch (1n) {
    case 1n:
      return 1n
    default:
      return 0n
  }
})`,
      errors: [{ message: /Client int_filter graphs do not support switch/ }]
    }
  ]
})

ruleTester.run('client-syntax-capabilities', clientSyntaxCapabilities, {
  valid: [
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const values = list('int', [1n, 2n, 3n])
  const complex = values.some((value) => value % 2n === 0n && value > 1n)
  values.forEach((value) => {
    f.equal(value, 1n)
  })
  for (const value of values) {
    if (value === 1n) continue
    if (value === 2n) break
  }
  let remainder = 5n
  remainder %= 2n
  if (complex) return
})
g.creationStatus().on('start1', (_evt, f) => {
  const values = list('int', [1n, 2n])
  f.doubleBranch(values.some((value) => value === 1n), () => {}, () => {})
})
g.boolFilter().on('start', (_evt, _f) =>
  list('int', [1n, 2n]).some((value) => value === 2n)
)`
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  if (f.equal(1n, 1n)) {
    f.continueExecutingPreviousFrameBehavior()
  }
  f.executeSkill(true, 1n)
})`
    },
    {
      filename,
      code: `${importG}
function gstsCreationStatusResume() {
  gsts.fCreationStatus.continueExecutingPreviousFrameBehavior()
}
g.creationStatus().on('start1', () => {
  gstsCreationStatusResume()
})`
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) =>
  f.continueExecutingPreviousFrameBehavior()
)`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  f.continueExecutingPreviousFrameBehavior()
  f.executeSkill(true, 1n)
})`,
      errors: [{ message: /must be the final statement in its branch/ }]
    },
    {
      filename,
      code: `${importG}
function gstsCreationStatusResume() {
  gsts.fCreationStatus.continueExecutingPreviousFrameBehavior()
  gsts.fCreationStatus.executeSkill(true, 1n)
}
g.creationStatus().on('start1', () => {
  gstsCreationStatusResume()
})`,
      errors: [{ message: /must be the final statement in its branch/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, f) => {
  const values = list('int', [1n, 2n])
  f.doubleBranch(values.some((value) => value > 1n), () => {}, () => {})
})`,
      errors: [{ message: /do not support some\(\); missing methods: initLocalVariable/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => {
  list('int', [1n]).forEach((value) => {
    bool(value)
  })
})`,
      errors: [{ message: /do not support forEach\(\); missing methods: listIterationLoop/ }]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  list('int', [1n]).push(2n)
})`,
      errors: [{ message: /do not support push\(\).*insertValueIntoList/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => {
  for (const value of list('int', [1n])) {
    bool(value)
  }
})`,
      errors: [{ message: /do not support this loop; missing methods: listIterationLoop/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => {
  for (let index = 0n; index < 2n; index++) {}
})`,
      errors: [{ message: /do not support this loop; missing methods: finiteLoop/ }]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, f) => {
  const mixed = f.addition(1n, 2n) % 2
  f.equal(mixed, 0n)
})`,
      errors: [{ message: /Client % requires both operands to have the same int or float type/ }]
    },
    {
      filename,
      code: `${importG}
g.characterSkill().on('start', (_evt, _f) => {
  let mixed = 5n
  mixed %= 2
})`,
      errors: [{ message: /Client % requires both operands to have the same int or float type/ }]
    },
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => {
  for (let index = 0n; index < 2n; index++) {
    return
  }
})`,
      errors: [
        { message: /do not support this loop; missing methods: finiteLoop/ },
        { message: /do not support return inside a loop; missing methods: initLocalVariable/ }
      ]
    }
  ]
})

ruleTester.run('no-json client default scope', noJson, {
  valid: [
    {
      filename,
      code: `${importG}
JSON.stringify({ ok: true })
g.creationStatus().on('start1', (_evt, _f) => {})`
    },
    {
      filename,
      options: [{ scope: 'server' }],
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => { JSON.stringify({ ok: true }) })`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
g.creationStatus().on('start1', (_evt, _f) => { JSON.stringify({ ok: true }) })`,
      errors: [{ message: /Compiler does not support this/ }]
    },
    {
      filename,
      code: `${importG}
g.server().on('update', (_evt, _f) => { JSON.stringify({ ok: true }) })`,
      errors: [{ message: /Compiler does not support this/ }]
    }
  ]
})

ruleTester.run('gsts-function-prefix', gstsFunctionPrefix, {
  valid: [
    {
      filename,
      code: `${importG}
function gstsServerShared() {}
function gstsClientCharacterSkillShared() {}
const gstsCharacterSkillShared = () => {}
function gstsClientCharacterControlSkillShared() {}
const gstsCharacterControlSkillShared = () => {}
function gstsClientCreationSkillShared() {}
const gstsCreationSkillShared = () => {}
function gstsClientCreationStatusShared() {}
const gstsCreationStatusShared = () => {}
function gstsClientCreationStatusDecisionShared() {}
const gstsCreationStatusDecisionShared = () => {}
function gstsClientBoolFilterShared() {}
const gstsBoolFilterShared = () => {}
function gstsClientIntFilterShared() {}
const gstsIntFilterShared = () => {}
gsts.fCharacterSkill`
    }
  ],
  invalid: [
    {
      filename,
      code: `
function gstsUnknownShared() {}
const gstsClientShared = () => {}`,
      errors: [
        {
          message: /available prefixes: (?![^\n]*gstsClient)gstsServer,[\s\S]*gstsCharacterSkill/
        },
        { message: /Function name "gstsClientShared" uses an unknown gsts prefix/ }
      ]
    }
  ]
})

ruleTester.run('graph-function-top-level-client-functions', graphFunctionTopLevel, {
  valid: [
    {
      filename,
      code: `
function gstsCreationSkillShared() {}
const gstsClientCharacterSkillShared = () => {}`
    }
  ],
  invalid: [
    {
      filename,
      code: `
function wrapper() {
  function gstsCreationSkillNested() {}
}`,
      errors: [{ message: /Graph functions must be declared at top level/ }]
    }
  ]
})

ruleTester.run('graph-function-parameters-client-functions', graphFunctionParameters, {
  valid: [
    {
      filename,
      code: `function gstsCreationSkillShared(value: bigint) { return value }`
    }
  ],
  invalid: [
    {
      filename,
      code: `function gstsCreationSkillBad({ value }: { value: bigint }) { return value }`,
      errors: [{ message: /Graph-function parameters must be unique identifiers/ }]
    }
  ]
})

ruleTester.run('graph-function-return-client-functions', graphFunctionReturn, {
  valid: [
    {
      filename,
      code: `function gstsCreationSkillShared(value: bigint) { return value }`
    }
  ],
  invalid: [
    {
      filename,
      code: `
function gstsCreationSkillBad(value: bigint) {
  if (value > 0n) return value
  return 0n
}`,
      errors: [{ message: /graph function must use one value-returning return/i }]
    }
  ]
})

ruleTester.run('graph-function-call-scope-client-functions', graphFunctionCallScope, {
  valid: [
    {
      filename,
      code: `${importG}
function gstsCreationSkillShared(value: bigint) { return value }
function gstsClientCreationSkillCaller() { return gstsCreationSkillShared(1n) }
g.creationSkill().on('start', () => { gstsCreationSkillShared(1n) })`
    }
  ],
  invalid: [
    {
      filename,
      code: `${importG}
function gstsCreationSkillShared() { return 1n }
gstsCreationSkillShared()
g.characterSkill().on('start', () => { gstsCreationSkillShared() })
g.server().on('update', () => { gstsCreationSkillShared() })`,
      errors: [
        { message: /can only be called from the same client graph family/ },
        { message: /can only be called from the same client graph family/ },
        { message: /can only be called from the same client graph family/ }
      ]
    }
  ]
})

ruleTester.run('no-graph-function-recursion-client-functions', noGraphFunctionRecursion, {
  valid: [
    {
      filename,
      code: `function gstsCreationSkillShared() { return 1n }`
    }
  ],
  invalid: [
    {
      filename,
      code: `
function gstsCreationSkillLoop(): bigint {
  return gstsCreationSkillLoop()
}`,
      errors: [{ message: /Node-graph functions must not be recursive/ }]
    }
  ]
})
