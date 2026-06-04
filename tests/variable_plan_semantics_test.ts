import { g } from 'genshin-ts/runtime/core'

enum Vars {
  IntValue = 'IntValue',
  FloatValue = 'FloatValue',
  BoolValue = 'BoolValue',
  StrValue = 'StrValue',
  LiveList = 'LiveList',
  LiveDict = 'LiveDict'
}

function makeUnknownList() {
  return gsts.f.assemblyList([8n, 9n], 'int')
}

g.server({
  id: 1073741891,
  variables: {
    [Vars.IntValue]: 1n,
    [Vars.FloatValue]: 1.5,
    [Vars.BoolValue]: true,
    [Vars.StrValue]: 'seed',
    [Vars.LiveList]: list('int', [0n, 0n, 0n]),
    [Vars.LiveDict]: dict([{ k: 'a', v: 1n }])
  }
}).on('whenEntityIsCreated', (_evt, f) => {
  f.printString('__CASE__:const_scalar_direct:start')
  const constScalarDirect = f.get(Vars.IntValue)
  f.printString(str(constScalarDirect))
  f.printString('__CASE__:const_scalar_direct:end')

  f.printString('__CASE__:let_scalar_local:start')
  let letScalarLocal = f.get(Vars.IntValue)
  letScalarLocal = letScalarLocal + 1n
  f.printString(str(letScalarLocal))
  f.printString('__CASE__:let_scalar_local:end')

  f.printString('__CASE__:const_scalar_reused:start')
  const constScalarReused = f.get(Vars.FloatValue)
  f.printString(str(constScalarReused))
  f.printString(str(constScalarReused))
  f.printString('__CASE__:const_scalar_reused:end')

  f.printString('__CASE__:live_list_f_get:start')
  const liveListFGet = f.get(Vars.LiveList)
  liveListFGet[idx(0n)] = 10n
  f.printString(str(liveListFGet[idx(0n)]))
  f.printString('__CASE__:live_list_f_get:end')

  f.printString('__CASE__:assembly_existing_live_list_copy:start')
  const assemblyExistingLiveList = f.assemblyList(f.get(Vars.LiveList))
  assemblyExistingLiveList[idx(0n)] = 18n
  f.printString(str(assemblyExistingLiveList[idx(0n)]))
  f.printString('__CASE__:assembly_existing_live_list_copy:end')

  f.printString('__CASE__:live_list_node_graph:start')
  const liveListNodeGraph = f.getNodeGraphVariable(Vars.LiveList).asType('int_list')
  liveListNodeGraph[idx(1n)] = 11n
  f.printString('__CASE__:live_list_node_graph:end')

  f.printString('__CASE__:live_list_custom_f:start')
  const selfForCustomF = f.getSelfEntity()
  const liveListCustomF = f.getCustomVariable(selfForCustomF, 'custom_list').asType('int_list')
  liveListCustomF[idx(2n)] = 12n
  f.printString('__CASE__:live_list_custom_f:end')

  f.printString('__CASE__:live_list_custom_entity:start')
  const selfForCustomEntity = f.getSelfEntity()
  const liveListCustomEntity = selfForCustomEntity.get('custom_list').asType('int_list')
  liveListCustomEntity[idx(0n)] = 13n
  f.printString('__CASE__:live_list_custom_entity:end')

  f.printString('__CASE__:live_list_custom_entity_full_name:start')
  const selfForCustomEntityFullName = f.getSelfEntity()
  const liveListCustomEntityFullName = selfForCustomEntityFullName
    .getCustomVariable('custom_list')
    .asType('int_list')
  liveListCustomEntityFullName[idx(0n)] = 23n
  f.printString('__CASE__:live_list_custom_entity_full_name:end')

  f.printString('__CASE__:let_live_list_local:start')
  let letLiveListLocal = f.get(Vars.LiveList)
  letLiveListLocal[idx(0n)] = 14n
  f.printString(str(letLiveListLocal[idx(0n)]))
  f.printString('__CASE__:let_live_list_local:end')

  f.printString('__CASE__:let_live_list_rebound_direct:start')
  let letLiveListRebound = f.get(Vars.LiveList)
  letLiveListRebound[1] = 3n
  letLiveListRebound = list('int', [1n])
  letLiveListRebound[idx(0n)] = 2n
  f.printString(str(letLiveListRebound[idx(0n)]))
  f.printString('__CASE__:let_live_list_rebound_direct:end')

  f.printString('__CASE__:let_live_list_alias_rebound_direct:start')
  const liveListAliasSource = f.get(Vars.LiveList)
  const liveListAliasSelf = f.getSelfEntity()
  const liveListAliasCustom = f
    .getCustomVariable(liveListAliasSelf, 'custom_list')
    .asType('int_list')
  let letLiveListAliasRebound = liveListAliasSource
  letLiveListAliasRebound[idx(1n)] = 31n
  letLiveListAliasRebound = list('int', [1n, 2n])
  letLiveListAliasRebound[idx(0n)] = 33n
  letLiveListAliasRebound = liveListAliasCustom
  letLiveListAliasRebound[idx(2n)] = 32n
  f.printString(str(liveListAliasSource[idx(1n)]))
  f.printString(str(liveListAliasCustom[idx(2n)]))
  f.printString('__CASE__:let_live_list_alias_rebound_direct:end')

  f.printString('__CASE__:let_live_list_rebound_in_branch_local:start')
  let letLiveListReboundInBranch = f.get(Vars.LiveList)
  if (f.get(Vars.BoolValue)) {
    letLiveListReboundInBranch = list('int', [2n])
  }
  letLiveListReboundInBranch[idx(0n)] = 24n
  f.printString(str(letLiveListReboundInBranch[idx(0n)]))
  f.printString('__CASE__:let_live_list_rebound_in_branch_local:end')

  f.printString('__CASE__:copy_list_local:start')
  const copyListLocal = f.copyList(f.get(Vars.LiveList))
  copyListLocal[idx(0n)] = 19n
  f.printString(str(copyListLocal[idx(0n)]))
  f.printString(str(f.get(Vars.LiveList)[idx(0n)]))
  f.printString('__CASE__:copy_list_local:end')

  f.printString('__CASE__:copy_list_readonly_local:start')
  const copyListReadonlyLocal = f.copyList(f.get(Vars.LiveList))
  f.printString(str(copyListReadonlyLocal[idx(1n)]))
  f.printString('__CASE__:copy_list_readonly_local:end')

  f.printString('__CASE__:temporary_assembly_list_local:start')
  const temporaryAssemblyList = f.assemblyList([1n, 2n], 'int')
  temporaryAssemblyList[idx(0n)] = 15n
  f.printString(str(temporaryAssemblyList[idx(0n)]))
  f.printString('__CASE__:temporary_assembly_list_local:end')

  f.printString('__CASE__:temporary_literal_list_local:start')
  const temporaryLiteralList: bigint[] = [1n, 2n]
  temporaryLiteralList[idx(0n)] = 16n
  f.printString(str(temporaryLiteralList[idx(0n)]))
  f.printString('__CASE__:temporary_literal_list_local:end')

  f.printString('__CASE__:temporary_list_wrapper_local:start')
  const temporaryListWrapper = list('int', [1n, 2n])
  temporaryListWrapper[idx(0n)] = 20n
  f.printString(str(temporaryListWrapper[idx(0n)]))
  f.printString('__CASE__:temporary_list_wrapper_local:end')

  f.printString('__CASE__:temporary_empty_list_wrapper_local:start')
  const temporaryEmptyListWrapper = list('int')
  temporaryEmptyListWrapper[idx(0n)] = 21n
  f.printString(str(temporaryEmptyListWrapper[idx(0n)]))
  f.printString('__CASE__:temporary_empty_list_wrapper_local:end')

  f.printString('__CASE__:unknown_list_local:start')
  const unknownList = makeUnknownList()
  unknownList[idx(0n)] = 17n
  f.printString(str(unknownList[idx(0n)]))
  f.printString('__CASE__:unknown_list_local:end')

  f.printString('__CASE__:live_dict_f_get:start')
  const liveDictFGet = f.get(Vars.LiveDict)
  liveDictFGet.set('b', 2n)
  f.printString(str(liveDictFGet.get('b')))
  f.printString('__CASE__:live_dict_f_get:end')

  f.printString('__CASE__:live_dict_node_graph:start')
  const liveDictNodeGraph = f.getNodeGraphVariable(Vars.LiveDict).asDict('str', 'int')
  liveDictNodeGraph.set('c', 3n)
  f.printString(str(liveDictNodeGraph.get('c')))
  f.printString('__CASE__:live_dict_node_graph:end')

  f.printString('__CASE__:live_dict_custom_f:start')
  const selfForCustomDictF = f.getSelfEntity()
  const liveDictCustomF = f
    .getCustomVariable(selfForCustomDictF, 'custom_dict')
    .asDict('str', 'int')
  liveDictCustomF.set('d', 4n)
  f.printString(str(liveDictCustomF.get('d')))
  f.printString('__CASE__:live_dict_custom_f:end')

  f.printString('__CASE__:live_dict_custom_entity:start')
  const selfForCustomDictEntity = f.getSelfEntity()
  const liveDictCustomEntity = selfForCustomDictEntity.get('custom_dict').asDict('str', 'int')
  liveDictCustomEntity.set('e', 5n)
  f.printString(str(liveDictCustomEntity.get('e')))
  f.printString('__CASE__:live_dict_custom_entity:end')

  f.printString('__CASE__:live_dict_custom_entity_full_name:start')
  const selfForCustomDictEntityFullName = f.getSelfEntity()
  const liveDictCustomEntityFullName = selfForCustomDictEntityFullName
    .getCustomVariable('custom_dict')
    .asDict('str', 'int')
  liveDictCustomEntityFullName.set('f', 6n)
  f.printString(str(liveDictCustomEntityFullName.get('f')))
  f.printString('__CASE__:live_dict_custom_entity_full_name:end')

  f.printString('__CASE__:temporary_dict_direct:start')
  const temporaryDict = dict([{ k: 'x', v: 1n }])
  temporaryDict.set('y', 2n)
  f.printString(str(temporaryDict.get('y')))
  f.printString('__CASE__:temporary_dict_direct:end')
})
