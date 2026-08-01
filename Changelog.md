# Changelog

## v0.2.2

- Fixed #18, where some client nodes with literal list arguments failed to compile.
- Improved compiler recognition of client entity types, preventing errors in convenience operations such as `clientEntityList.length`.

## v0.2.1

- Improved map signal checking and extraction performance by filtering out unrelated fields. This prevents extremely long waits and apparent hangs during node graph injection and when compiling signal-sending nodes for complex maps. Thanks to @AncherEven.
- Added targeted data reuse, caching, and batch processing throughout the compilation, injection, and resource extraction pipeline, improving end-to-end project performance by more than 50%.
- Updated project dependencies. If your project was created from an older template and you upgrade to ESLint 10, you must install `@eslint/js` manually for linting to work. Upgrading only `genshin-ts` is unaffected.

## v0.2.0

** This release contains potentially breaking changes. Please read the changelog before updating. **

- All seven client node graph types are now supported, with APIs similar to server node graphs. For example, `g.characterSkill().on('start', (_, f) => {})` defines a Character Skill graph. Hover over the relevant methods and events for more details.
- Added a range of server nodes and events introduced in recent game updates.
- Added and revised several ESLint rules to improve the development experience for both server and client node graphs. Some rules have been renamed; if you have a custom ESLint configuration, these renames are breaking changes and the configuration must be updated.
- Updated the documentation comments for a number of functions and added more GSTS notes.
- Added the global `clientEntity` helper for client node graphs. It narrows an entity to the appropriate client entity type and exposes entity shortcuts available only in the current client graph.
- Improved the node graph injector to prevent several cases where injection could fail.
- Improved automatic initialization of the global `stage` / `level` helpers. A recent Miliastra Wonderland update appears to have made the execution order of multiple nodes for the same event nondeterministic—even the event node with ID 1 is no longer guaranteed to run first. This could leave `stage` / `level` with an invalid entity when accessed during entity creation. Initialization now runs reliably at the start of every `whenEntityIsCreated` event flow.
- Fixed list-valued signal arguments not being wired correctly. Thanks to @AncherEven.
- Corrected an official documentation typo in the return value of `querySpecifiedMiniMapMarkerInformation` (`Query Specified Mini-Map Marker Information`): `activationStaet` is now `activationStatus`. Existing code that uses this field must be updated to compile.
- The `settlementStatus` parameter of `getPlayerRankScoreChange` and `setPlayerRankScoreChange` now uses the `RankSettlementStatus` enum instead of `SettlementStatus`, with a new `Escape` value. Existing calls must update their enum arguments after upgrading.
- Added client node graph guidance to the `npm create genshin-ts@latest` project template.
- Fixed various other minor issues.

## v0.1.10

** This release contains potentially breaking changes. Please read the changelog before updating. ** - Thanks to @wangxiangyao and @longyuan1996 for contributing code to this release.

- Signal sending and listening now support passing and reading parameters. After map injection settings are configured, compilation automatically extracts all signals and parameters from the map and provides complete TypeScript type information. See https://gsts.moe/doc/events/signals for usage details. #9
- When reading a node graph variable or custom variable whose type is a list, modifying the returned value now directly affects the original value. Previous versions modified a copy of the list; use `f.copyList` manually when you need a list copy. The old behavior made it inconvenient to modify the original list directly and could produce different results for similarly shaped code, which was unintuitive, so this is treated as a bug fix. The new behavior can produce simpler and more efficient node graphs. See https://gsts.moe/doc/writing/ts-subset for details. #11
- Updated nodes added in the latest Miliastra Wonderland version. In addition, the return values of `consumeGiftBox` and `getEntityAdvancedAttribute` have changed, which may potentially cause compile errors after upgrading. Function node descriptions have also been synced with the official documentation.
- `switch` cases with constant values now compile correctly. #12
- Accessing constant expressions now produces fewer redundant local variable nodes. #12
- Preset resources now include all character IDs: `CharacterPrefabZh` and `CharacterPrefab`.
- Fixed an issue where assigning a literal constant to a variable did not use a local variable node correctly even when the variable was declared with `let`.
- Fixed an issue where taking the modulo of a loop variable inside a loop was incorrectly handled as `float`. Miliastra Wonderland only supports integer modulo, so this is now forced to integer handling.
- The IR JSON now supports a series of node aliases. Because the official English names of some nodes changed, both old and new names can now compile successfully.
- Updated the `create-genshin-ts` project template.

## v0.1.9

- Updated a batch of newly added server nodes and events from the latest game version.
- Updated older nodes as well, including ones that gained new parameters in newer versions.
- Updated node function comments and descriptions to match the official documentation, including revised usage notes where the docs have changed.

## v0.1.8

- Add extra project template guidance on editor-vs-code responsibilities to better guide AI development.

## v0.1.7

- Fixed missing support in GIA encoding for `prefabId` list used as dictionary value and passed as argument, which caused related node parameters in generated graphs to lose their connections.

BTW: development was paused last month due to some real-life matters, and work on the project will now continue.

## v0.1.6

- For array index access, this project uses `bigint` as the integer type, while TypeScript does not allow `bigint` as an index type by default. To address this, this release introduces two auto-fix approaches: ESLint and a TypeScript plugin. See ESLint diagnostics for details.
- The project template generated by `npm create genshin-ts@latest` has received notable updates.
- Fixed a regression from previous type-system changes that caused Chinese event hover docs/comments to stop showing correctly.

## v0.1.5

- Allowed common JS-style self-cleaning `setInterval` callbacks, for example:
    ```ts
    const h = setInterval(() => {
        f.printString('hello')
        if (condition) {
            clearInterval(h)
        }
    }, 1000)
    ```
- Allowed modifying outer `let` variables inside timer callbacks (including array mutations like `push`) so behavior matches normal JS expectations for common patterns. Code like below now compiles correctly:
    ```ts
    let acc = 5n
    const h = setInterval(() => {
        acc += 2n
        f.printString(str(acc))
        if (acc >= 9n) {
            clearInterval(h)
        }
    }, 1000)
    ```
- Fixed missing captures in nested callbacks inside timer callbacks. For example:
    ```ts
    setTimeout(() => {
        nums.forEach((v) => {
            f.printString(label)
            f.printString(str(v + base))
        })
    }, 200)
    ```
  Previously only `nums` was captured, while `label` and `base` were not captured correctly.
- Fixed a compile error where function symbols called inside timer callbacks were incorrectly treated as captured variables.
- `Array.forEach` callback parameters are no longer required and may be omitted.

## v0.1.4

- Fixed cases where eslint and timer-closure capture showed incorrect entity types after the entity type system became more complex in the previous release; the compiler now uses smarter entity type inference to avoid errors with complex type systems.
- In dev mode, external map saves now trigger auto re-injection, so accidental overwrites no longer require manual re-injection; this can be adjusted in config.
- Added support for extracting custom prefab names and ids from maps into code for easier lookup and interaction; the switch and output path are configurable.
- Added stricter validation for Beyond Mode and Classic Mode nodes to avoid accidentally using unavailable nodes via shortcuts; such cases now surface errors directly.
- Added an eslint warning for accessing outer event parameters inside timer callbacks, guiding users to fix it.

## v0.1.3

- The type system now automatically constrains node availability between Beyond Mode and Classic Mode
- Support placeholder methods like dict(0) and list(0) to allow empty argument pins in some nodes
- Added more detailed hover docs and usage notes for helper functions like raw/float/int/guid/list/dict
- Added a new Classic Mode node: `Revive Active Character`
- Fixed an error when creating the `Teleport Player` node in Classic Mode

## v0.1.2

- g.server() now accepts a mode field to switch between Beyond Mode and Classic Mode
- Added 14 new server nodes introduced in version 6.3, plus related entity helper properties and methods such as .activeCharacter and .classicModeId
- The type system does not yet distinguish node availability by mode; all nodes can be injected regardless of mode and must be used with care

## v0.1.1

- Initial release
