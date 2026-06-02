# 2026-05-26 Node Consistency Risk Review

This note records the current `scripts/check-node-def-consistency.ts` findings after adding the
new node coverage for the post-`v0.1.9` maintenance pass.

Command used:

```sh
npx tsx scripts/check-node-def-consistency.ts
```

Current summary:

- `registerNode` calls: 409
- unique static node types: 406
- findings: 6
- new nodes `829..834`: no consistency finding
- classic-only nodes: now covered by `tests/generated/classic.literal.ts`

## Verification Table

| Node / method                                                                                 | Current project status                                                                                                                                                 | New inconsistency status                                                                                                                                     | Local evidence                                               | What needs editor verification                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data_type_conversion_*` / `dataTypeConversion`                                               | Uses a dynamic node type built from the requested conversion target. The static checker cannot map every concrete `data_type_conversion_*` variant from this template. | Still reported as `dynamic_node_type`; not a newly introduced pin mismatch.                                                                                  | `src/definitions/nodes.ts:801`                               | No node truth needed unless we want the checker to expand dynamic variants. Verify only the checker strategy.                                                                                               |
| `set_custom_variable` / `setCustomVariable`                                                   | TypeScript API exposes 4 logical args: target entity, variable name, value, trigger event.                                                                             | Third-party pin record has 5 inputs: `Ety`, `Str`, `R<T>`, `Unk`, `Bol`. New status is unchanged; this is an existing hidden/unknown pin risk.               | `src/definitions/nodes.ts:1593`, `node_pin_records.ts:169`   | Export a graph with `triggerEvent=true` and a non-default value. Confirm whether index 3 is a hidden hole/default pin that should be emitted as empty, or whether the local API is missing a real argument. |
| `activate_disable_pathfinding_obstacle_feature` / `activateDisablePathfindingObstacleFeature` | TypeScript API exposes 2 logical args: target entity, activate.                                                                                                        | Third-party pin record has 3 inputs: `Ety`, `Unk`, `Bol`. New status is unchanged; likely hidden pin at index 1.                                             | `src/definitions/nodes.ts:4473`, `node_pin_records.ts:4332`  | Export the node and confirm whether pin index 1 is hidden/empty and whether GIA import requires a placeholder.                                                                                              |
| `activate_disable_pathfinding_obstacle` / `activateDisablePathfindingObstacle`                | TypeScript API exposes 3 logical args: target entity, obstacle id, activate.                                                                                           | Third-party pin record has 4 inputs: `Unk`, `Ety`, `Int`, `Bol`. New status is unchanged; likely leading hidden pin.                                         | `src/definitions/nodes.ts:4450`, `node_pin_records.ts:4338`  | Export the node and confirm whether index 0 is a hidden/empty pin and whether local output must preserve that hole.                                                                                         |
| `remove_unit_status` / `removeUnitStatus`                                                     | TypeScript API exposes 4 logical args: target entity, status config id, removal method, remover entity.                                                                | Third-party pin record has 5 inputs: `Ety`, `Cfg`, `E<18>`, `Unk`, `Ety`. Local comment already notes vendor indices `0/1/2/4`, with index `3` hidden/empty. | `src/definitions/nodes.ts:5776`, `node_pin_records.ts:1711`  | Reconfirm the existing note with a fresh export. If confirmed, add this node to the consistency checker allowlist with the hidden-pin explanation.                                                          |
| `exponentiation` / `exponentiation`                                                           | TypeScript API exposes 2 logical args: base and exponent.                                                                                                              | Third-party pin record has 3 inputs: `R<T>`, `R<T>`, `E<0>`. Local comment says vendor GIA has an extra enum item input at index 2.                          | `src/definitions/nodes.ts:10475`, `node_pin_records.ts:1233` | Export int and float exponentiation variants. Confirm whether the enum pin is hidden/default, and whether compiler output must include it.                                                                  |

## Current Decision

Do not change these six runtime definitions from static evidence alone. They are not caused by the
new `829..834` node additions. Treat them as editor-truth verification items before changing either
`nodes.ts`, `node_pin_records.ts`, or the consistency-check allowlist.

## 2026-06-01 Editor Export Verification

Export file:
`C:\Users\josSt\AppData\LocalLow\miHoYo\原神\BeyondLocal\Beyond_Local_Export\2026-06-01-verify1.gia`

Result:

| Node / method | Exported input pins | Conclusion |
| --- | --- | --- |
| `set_custom_variable` / `setCustomVariable` | `0, 1, 2, 4` for int, bool, and `dict<str,int>` variants. Pin `3` is absent. | Confirmed editor-truth hole. Local 4-arg API is correct; allowlist in consistency checker. |
| `activate_disable_pathfinding_obstacle` / `activateDisablePathfindingObstacle` | `1, 2, 3`. Pin `0` is absent. | Confirmed leading hidden/hole pin. Local 3-arg API is correct; allowlist. |
| `activate_disable_pathfinding_obstacle_feature` / `activateDisablePathfindingObstacleFeature` | `0, 2`. Pin `1` is absent. | Confirmed hidden/hole pin. Local 2-arg API is correct; allowlist. |
| `remove_unit_status` / `removeUnitStatus` | `0, 1, 2, 4`. Pin `3` is absent. | Existing local note is confirmed; allowlist. |
| `exponentiation` / `exponentiation` | int variant: `0, 1`; float variant: `0, 1`. No enum input pin was exported. | Third-party pin record includes an extra enum pin, but editor export omits it. Local 2-arg API is correct; allowlist. |
| `data_type_conversion_*` / `dataTypeConversion` | Concrete node ids observed: int->str, float->str, bool->str, guid->str, faction->str, int->float, float->int. | Dynamic node type behavior confirmed. This remains a checker strategy issue, not a runtime definition mismatch. |

## Manual Verification Script

Use `tests/manual_verify_consistency_risk_nodes.ts` for editor import/export verification. The
script uses one graph, with chained `.on(...)` event declarations split by risk point:

| Graph id | Event | Risk point | What to report back |
| --- | --- | --- | --- |
| `1073742310` | `whenEntityIsCreated` | `set_custom_variable` extra `Unk` pin | Whether import succeeds; exported input pin count/order; whether the unknown pin appears as an empty/default placeholder. |
| `1073742310` | `whenEntityIsDestroyed` | pathfinding obstacle hidden pins | Whether both obstacle nodes import; exported input pin count/order for feature and non-feature nodes; which index is empty/default. |
| `1073742310` | `whenTimerIsTriggered` | `remove_unit_status` index `3` hidden pin | Whether import succeeds; exported input pin count/order; whether index `3` remains empty/default while remover entity is index `4`. |
| `1073742310` | `whenSkillNodeIsCalled` | `exponentiation` extra enum pin | Whether int and float exponentiation import; exported input pin count/order; enum pin value if present. |
| `1073742310` | `whenGlobalTimerIsTriggered` | `data_type_conversion_*` dynamic node type | Whether all conversions import/export as concrete `data_type_conversion_*` node types; list the concrete node types seen. |

Preferred feedback format:

```text
graph 1073742310: import ok/fail
event: whenEntityIsCreated
exported node input pins:
- set_custom_variable: [0]=..., [1]=..., [2]=..., [3]=..., [4]=...
notes:
```
