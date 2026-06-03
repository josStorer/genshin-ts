import { g } from 'genshin-ts/runtime/core'

enum Vars {
  IntValue = 'IntValue'
}

g.server({
  id: 1073741892,
  variables: {
    [Vars.IntValue]: 1n
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString('__CASE__:assembly_callback_f:start')
  const assemblyCallbackF = f.assemblyList([1n + 2n, 3n], 'int')
  f.printString(str(assemblyCallbackF[idx(0n)]))
  f.printString('__CASE__:assembly_callback_f:end')

  f.printString('__CASE__:assembly_gsts_root:start')
  const assemblyGstsRoot = gsts.f.assemblyList([4n + 5n, 6n], 'int')
  f.printString(str(assemblyGstsRoot[idx(0n)]))
  f.printString('__CASE__:assembly_gsts_root:end')

  f.printString('__CASE__:assembly_global_this_root:start')
  const assemblyGlobalThisRoot = globalThis.gsts.f.assemblyList([7n + 8n, 9n], 'int')
  f.printString(str(assemblyGlobalThisRoot[idx(0n)]))
  f.printString('__CASE__:assembly_global_this_root:end')

  f.printString('__CASE__:multiple_branches_callback_f:start')
  f.multipleBranches(1n, {
    1: () => {
      let branchCounterF = f.get(Vars.IntValue)
      branchCounterF = branchCounterF + 1n
      f.printString(str(branchCounterF))
    },
    default: () => {
      f.printString('default-f')
    }
  })
  f.printString('__CASE__:multiple_branches_callback_f:end')

  f.printString('__CASE__:multiple_branches_gsts_root:start')
  gsts.f.multipleBranches(2n, {
    2: () => {
      let branchCounterGsts = f.get(Vars.IntValue)
      branchCounterGsts = branchCounterGsts + 2n
      f.printString(str(branchCounterGsts))
    },
    default: () => {
      f.printString('default-gsts')
    }
  })
  f.printString('__CASE__:multiple_branches_gsts_root:end')

  f.printString('__CASE__:multiple_branches_global_this_root:start')
  globalThis.gsts.f.multipleBranches(3n, {
    3: () => {
      let branchCounterGlobalThis = f.get(Vars.IntValue)
      branchCounterGlobalThis = branchCounterGlobalThis + 3n
      f.printString(str(branchCounterGlobalThis))
    },
    default: () => {
      f.printString('default-global-this')
    }
  })
  f.printString('__CASE__:multiple_branches_global_this_root:end')
})
