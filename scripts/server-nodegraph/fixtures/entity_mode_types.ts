import type {
  CharacterEntity,
  EntityOf,
  EntityOfByMode,
  EntityValueByMode,
  PlayerEntity
} from '../../../src/definitions/entity_helpers.js'
import type { ServerEventPayloadsByMode } from '../../../src/definitions/events-payload-mode.js'
import type {
  ServerExecutionFlowFunctions,
  ServerExecutionFlowFunctionsByMode
} from '../../../src/definitions/nodes.js'
import type { EntityValue } from '../../../src/runtime/value.js'

type Assert<T extends true> = T
type IsAssignable<From, To> = [From] extends [To] ? true : false

type LocationInput = Parameters<ServerExecutionFlowFunctions['getEntityLocationAndRotation']>[0]
type BeyondEnteringEntity =
  ServerEventPayloadsByMode<'beyond'>['whenEnteringCollisionTrigger']['enteringEntity']
type ClassicEnteringEntity =
  ServerEventPayloadsByMode<'classic'>['whenEnteringCollisionTrigger']['enteringEntity']

type _BeyondEventEntityCanBeUsedAsLocationInput = Assert<
  IsAssignable<BeyondEnteringEntity, LocationInput>
>
type _ClassicEventEntityCanBeUsedAsLocationInput = Assert<
  IsAssignable<ClassicEnteringEntity, LocationInput>
>
type _BeyondEntityCanBeUsedAsGenericEntityInput = Assert<
  IsAssignable<EntityValueByMode<'beyond'>, EntityValue>
>
type _ClassicEntityCanBeUsedAsGenericEntityInput = Assert<
  IsAssignable<EntityValueByMode<'classic'>, EntityValue>
>
type _ModeSpecificCharacterCanBeUsedAsCharacterInput = Assert<
  IsAssignable<EntityOfByMode<'character', 'beyond'>, EntityOf<'character'>>
>
type CharacterInput = Parameters<ServerExecutionFlowFunctions['getCharacterAttribute']>[0]
type PlayerInput = Parameters<ServerExecutionFlowFunctions['reviveActiveCharacter']>[0]
type _BeyondEventCharacterCanBeUsedAsCharacterInput = Assert<
  IsAssignable<
    ServerEventPayloadsByMode<'beyond'>['whenCharacterRevives']['characterEntity'],
    CharacterInput
  >
>
type _ClassicEventCharacterCanBeUsedAsCharacterInput = Assert<
  IsAssignable<
    ServerEventPayloadsByMode<'classic'>['whenCharacterRevives']['characterEntity'],
    CharacterInput
  >
>
type _ClassicEventEntityCanBeUsedAsPlayerInput = Assert<
  IsAssignable<
    ServerEventPayloadsByMode<'classic'>['whenEntityIsCreated']['eventSourceEntity'],
    PlayerInput
  >
>
type _ModeSpecificPlayerCanBeUsedAsPlayerInput = Assert<
  IsAssignable<EntityOfByMode<'player', 'classic'>, PlayerInput>
>
type _PlayerCannotBeUsedAsCharacterInput = Assert<
  IsAssignable<PlayerEntity, CharacterInput> extends false ? true : false
>
type _CharacterCanBeUsedAsSpatialEntityInput = Assert<IsAssignable<CharacterEntity, LocationInput>>
type _PlayerCannotBeUsedAsSpatialEntityInput = Assert<
  IsAssignable<PlayerEntity, LocationInput> extends false ? true : false
>

type LatestBeyondOnlyMethods =
  | 'activateDisableCursorCollisionBox'
  | 'queryControlMotorSCurrentMovementParameters'
  | 'queryPlayerSCurrentActiveControlMotorList'
  | 'queryPlayerSCurrentFollowingControlMotor'
  | 'queryWhetherPlayerSCursorIsActive'
  | 'setPlayerActiveControlMotors'
  | 'setPlayerSCursorClickSelectableTargets'
  | 'setPlayerToFollowControlMotor'
  | 'setPlayerToLeaveControlMotor'
  | 'setWhetherPlayerSCursorClickPenetratesUiControls'
  | 'setWhetherPlayerSCursorIsPersistent'

type LatestDualModeMethods =
  | 'getModelColorAndMaterial'
  | 'modifyModelColorAndMaterial'
  | 'queryWhetherPlayerIsSubscribed'

type _LatestBeyondMethodsAreAvailable = Assert<
  LatestBeyondOnlyMethods extends keyof ServerExecutionFlowFunctionsByMode<'beyond'> ? true : false
>
type _LatestBeyondMethodsAreExcludedFromClassic = Assert<
  LatestBeyondOnlyMethods extends keyof ServerExecutionFlowFunctionsByMode<'classic'> ? false : true
>
type _LatestDualMethodsAreAvailableInBeyond = Assert<
  LatestDualModeMethods extends keyof ServerExecutionFlowFunctionsByMode<'beyond'> ? true : false
>
type _LatestDualMethodsAreAvailableInClassic = Assert<
  LatestDualModeMethods extends keyof ServerExecutionFlowFunctionsByMode<'classic'> ? true : false
>

type LatestBeyondPlayerHelperMethods =
  | 'queryPlayerSCurrentActiveControlMotorList'
  | 'queryPlayerSCurrentFollowingControlMotor'
  | 'queryWhetherPlayerSCursorIsActive'
  | 'setPlayerActiveControlMotors'
  | 'setPlayerSCursorClickSelectableTargets'
  | 'setPlayerToFollowControlMotor'
  | 'setPlayerToLeaveControlMotor'
  | 'setWhetherPlayerSCursorClickPenetratesUiControls'
  | 'setWhetherPlayerSCursorIsPersistent'

type _LatestBeyondPlayerHelpersAreAvailable = Assert<
  LatestBeyondPlayerHelperMethods extends keyof EntityOfByMode<'player', 'beyond'> ? true : false
>
type _LatestBeyondPlayerHelpersAreExcludedFromClassic = Assert<
  LatestBeyondPlayerHelperMethods extends keyof EntityOfByMode<'player', 'classic'> ? false : true
>
type _LatestCollisionHelperIsBeyondOnly = Assert<
  'activateDisableCursorCollisionBox' extends keyof EntityOfByMode<'object', 'beyond'>
    ? 'activateDisableCursorCollisionBox' extends keyof EntityOfByMode<'object', 'classic'>
      ? false
      : true
    : false
>
type _LatestDualObjectHelpersAreAvailableInClassic = Assert<
  'getModelColorAndMaterial' | 'modifyModelColorAndMaterial' extends keyof EntityOfByMode<
    'object',
    'classic'
  >
    ? true
    : false
>
type _LatestSubscribedHelperIsAvailableInClassic = Assert<
  'queryWhetherPlayerIsSubscribed' extends keyof EntityOfByMode<'player', 'classic'> ? true : false
>
type _LatestEventEntityListsRemainConnectable = Assert<
  IsAssignable<
    ServerEventPayloadsByMode<'beyond'>['whenPlayerSActiveControlMotorListChanges']['currentActiveControlMotorEntities'],
    EntityValueByMode<'beyond'>[]
  >
>
