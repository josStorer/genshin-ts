import type { PlayerEntity } from 'genshin-ts/definitions/entity_helpers'
import { RemovalMethod } from 'genshin-ts/definitions/enum'
import { g } from 'genshin-ts/runtime/core'

// Manual import/export verification for consistency-risk pin records.
// Inject this graph, export it back from the editor, and compare the listed node inputs.

g.server({
  id: 1073741825,
  lang: 'en',
  mode: 'beyond'
})
  .on('whenEntityIsCreated', (_evt, f) => {
    const self = f.getSelfEntity()
    const dynInt = f.addition(2n, 3n)
    const dynBool = f.equal(dynInt, dynInt)
    const dynStr = f.dataTypeConversion(dynInt, 'str')
    const intList = f.assemblyList([dynInt, dynInt, dynInt], 'int')
    const strList = f.assemblyList([dynStr, dynStr, dynStr], 'str')
    const dictStrInt = f.createDictionary(strList, intList)

    f.setCustomVariable(self, 'risk_cv_int_event_true', dynInt, true)
    f.setCustomVariable(self, 'risk_cv_bool_event_false', dynBool, false)
    f.setCustomVariable(self, 'risk_cv_dict_event_true', dictStrInt, true)
  })
  .on('whenEntityIsDestroyed', (_evt, f) => {
    const self = f.getSelfEntity()
    const obstacleId = f.addition(10n, 20n)
    const enable = f.equal(obstacleId, obstacleId)
    const disable = f.logicalNotOperation(enable)

    f.activateDisablePathfindingObstacle(self, obstacleId, enable)
    f.activateDisablePathfindingObstacle(self, 31n, disable)
    f.activateDisablePathfindingObstacleFeature(self, enable)
    f.activateDisablePathfindingObstacleFeature(self, false)
  })
  .on('whenTimerIsTriggered', (_evt, f) => {
    const self = f.getSelfEntity()
    const player = self as unknown as PlayerEntity
    const statusConfig = f.queryPlayerClass(player)

    f.removeUnitStatus(self, statusConfig, RemovalMethod.AllCoexistingStatusesWithTheSameName, self)
    f.removeUnitStatus(self, configId(7002n), RemovalMethod.StatusWithFastestStackLoss, self)
  })
  .on('whenSkillNodeIsCalled', (_evt, f) => {
    const dynIntBase = f.addition(2n, 3n)
    const dynIntExponent = f.addition(1n, 2n)
    const dynFloatBase = f.division(9.0, 2.0)
    const dynFloatExponent = f.pi()

    const intPower = f.exponentiation(dynIntBase, dynIntExponent)
    const floatPower = f.exponentiation(dynFloatBase, dynFloatExponent)

    f.printString(str(intPower))
    f.printString(str(floatPower))
  })
  .on('whenGlobalTimerIsTriggered', (_evt, f) => {
    const self = f.getSelfEntity()
    const dynInt = f.addition(8n, 13n)
    const dynFloat = f.division(21.0, 5.0)
    const dynBool = f.equal(dynInt, dynInt)
    const dynGuid = f.queryGuidByEntity(self)
    const dynFaction = f.queryEntityFaction(self)

    f.printString(f.dataTypeConversion(dynInt, 'str'))
    f.printString(f.dataTypeConversion(dynFloat, 'str'))
    f.printString(f.dataTypeConversion(dynBool, 'str'))
    f.printString(f.dataTypeConversion(dynGuid, 'str'))
    f.printString(f.dataTypeConversion(dynFaction, 'str'))
    f.printString(str(f.dataTypeConversion(dynInt, 'float')))
    f.printString(str(f.dataTypeConversion(dynFloat, 'int')))
  })
