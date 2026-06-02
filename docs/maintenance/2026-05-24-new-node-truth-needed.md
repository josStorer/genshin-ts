# 2026-05-24 New Node Truth

This note tracks new server nodes that were added to `src/definitions/nodes.ts` and needed editor-exported truth before they could be validated in `.gia` output.

Do not invent `node_id` or pin records for these nodes. Create them in the editor, export a `.gia`, then decode the concrete IDs and pin records.

## Resolved Vendor IDs

Resolved from `C:\Users\josSt\AppData\LocalLow\miHoYo\原神\BeyondLocal\Beyond_Local_Export\2026-05-26-verify1.gia`.

| Method                            | Node Type                              | Export Node Index | Node ID | Pins                             |
| --------------------------------- | -------------------------------------- | ----------------: | ------: | -------------------------------- |
| `refreshNotificationQueue`        | `refresh_notification_queue`           |                 1 |     833 | `Ety`, `Int`, `Int` input        |
| `switchCustomMaps`                | `switch_custom_maps`                   |                 5 |     834 | `Ety`, `Cfg`, `Bol` input        |
| `noOfTasksConfigured`             | `no_of_tasks_configured`               |                 9 |     829 | `Ety`, `Int`, `Int` input        |
| `increaseTaskCount`               | `increase_task_count`                  |                10 |     830 | `Ety`, `Int`, `Int` input        |
| `querySpecifiedTaskCount`         | `query_specified_task_count`           |                11 |     832 | `Ety`, `Int` input; `Int` output |
| `queryIfSpecifiedTaskIsCompleted` | `query_if_specified_task_is_completed` |                12 |     831 | `Ety`, `Int` input; `Bol` output |

`Refresh Notification Queue` has a fourth structure input in the editor, and its concrete ID depends on the selected structure. The project does not support structure-typed node inputs yet, so the fourth parameter is intentionally left unsupported for now and the local pin record only models the first three inputs.

`Teleport Player (Classic Mode)` is not represented as a separate TypeScript API. Use `teleportPlayer`; the compiler resolves `teleport_player` to the classic or beyond vendor ID based on the graph mode.

## Confirmed Manual Decisions

- `whenTheActiveCharacterChanges` has parameters in the editor. Keep the existing event payload and ignore the resource signature drift for now.
- Rename candidates are treated as resource/display-name drift. Keep the existing TypeScript API names and maintain compiler/testgen mappings from the new resource node type names to the existing vendor node type names.

## Manual Editor Graph Checklist

Create one server graph that calls the following nodes in order. Use non-default literal values where possible, and wire query outputs into a print or conversion node so output pins are visible in the export.

1. `Refresh Notification Queue`
   - Player Entity: self/player entity
   - Notification Queue Index: `1`
   - Notification Item ID: `2`
   - Notification Queue Data: leave blank until structure-typed node inputs are supported

2. `Switch Custom Maps`
   - Target Player: self/player entity
   - Map Config ID: non-zero config id
   - Display Map: `true`

3. `No. of Tasks Configured`
   - Player Entity: self/player entity
   - Quest Index: `3`
   - Task Count: `4`

4. `Increase Task Count`
   - Player Entity: self/player entity
   - Quest Index: `3`
   - Task Count Increased By: `1`

5. `Query Specified Task Count`
   - Player Entity: self/player entity
   - Quest Index: `3`
   - Wire `Task Count` output to a visible consumer.

6. `Query If Specified Task is Completed`
   - Player Entity: self/player entity
   - Quest Index: `3`
   - Wire `Completed` output to a visible consumer.

## Values To Extract

For each exported node, record:

- concrete node ID
- input pin order and pin types
- output pin order and pin types
- whether any pin index has a hole
- concrete ID and structure pin details for `Refresh Notification Queue` data once structure-typed node inputs are supported
