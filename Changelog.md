# Changelog

## v0.3.0

** This release contains potentially breaking changes. Please read the changelog before updating. ** - Thanks to @yanyvpingsheng for code contributions to this release.

- Added support for the client-side Lua widget scripts introduced in 7.1, with complete compilation, type system and documentation comment support, plus a set of convenience helpers. You can now write client widget scripts in TypeScript and compile them to Lua, defining an entry with `g.clientControlScript(...)`. Scripts can import TypeScript modules as usual, and native Lua scripts can be imported directly once they have TypeScript type declarations. Compiled scripts can be injected into the map's Lua script directory automatically. See https://gsts.moe/en/doc/lua for details. You can create a new Lua project from the template with `npm create genshin-ts`; to add Lua to a project created from an older template, follow the steps at https://gsts.moe/en/doc/lua#add-lua
- Lua scripts can exchange signals with server node graphs, listen to custom variables and key and cursor events, use timers, read script variables, and call public methods of other mounted scripts. The server node function `sendLua()` and the Lua function `send()` provide fully typed communication between the two sides. Inside the entry callback, the `lua` parameter gives direct access to features such as key listening through `lua.onKey`/`lua.onSignal`, `lua.helper.xx` and the like, all written in TypeScript style.
- Added the `gsts lua locate` command, which maps Lua errors from the in-game log back to TypeScript source lines. You can copy the whole log in game and run the command: it reads the clipboard automatically, or takes a file path. Added the `gsts lua check` command for a full type and rule check of Lua projects.
- Redesigned project creation with `npm create genshin-ts`. It is now a guided setup offering two templates, node graphs only or node graphs plus Lua, and it can pick the map to inject from your local saves and complete the configuration automatically.
- Server node graphs can send signals to client Lua scripts with `sendLua(player, ...)`, `sendLuaAll(...)` and `player.sendLua(...)`. Note that the existing `f.sendSignal` does not reach Lua.
- Added and updated a range of nodes and events from the 7.1 and 7.2 game updates, including the Creation Disruptor Device, Extra Push Collision and the Combat Text Filter Template. Nodes with new parameters mainly include When Attacked, Initiate Attack and Get Creation Attribute.
- Added short entity method names `openGiftBoxUi`, `setSkillInstanceCd`/`addSkillInstanceCd` and `switchCombatTextTemplate`. Client node graphs can also use `hasUnitStatus`.
- The documentation comments of many nodes and events have been synchronized with the latest official 7.2 text.
- `CharacterPrefab` now includes the Classic Mode character IDs up to 7.2.
- Added `exposed(...)` for node graph variables. It exposes a node graph variable on entities, so each entity can be given a different value in the editor. This suits a node graph attached to several entities that each need their own configuration, such as monster parameters or text. Since 7.2, text filled in on entities is also collected by the multilingual text tool.
- Fixed `setCharacterSkillCd` (Set Character Skill CD) generating the Increase Character Skill CD node instead. This bug exists in v0.2.3 and all earlier versions; if you use this method, it will correctly set the cooldown after updating.
- Note: in client node graphs, the `scaleOfCuboidHitbox` parameter (scale of a cuboid hitbox) of the 4 hitbox nodes (`triggerHitboxAtSpecificLocation` and others) only accepts a literal in the 7.2 editor. Code that connected a value to this parameter will fail to compile after updating.
- Added a series of compile checks that reject code which used to compile but behaved incorrectly in game. Each error message explains how to fix the code. Some existing code may fail to compile after updating:
  - Assigning a node result to an outer variable in one event and reading it in another event creates a data wire across events. This is now a compile error, and ESLint warns about it as well.
  - Reading the outer event parameter `evt` directly inside a timer callback is now a compile error. Store the value in a constant first and use it in the callback. ESLint already warned about this before, but compilation still succeeded.
  - Reassigning a function parameter or a loop variable inside a branch, a loop body or a callback is now a compile error. Copy the value into a new `let` variable and modify that instead. ESLint has a matching new warning.
  - Reassigning the list being iterated inside a `for...of` loop is now a compile error.
  - Unsupported operations inside the callbacks of native branch nodes such as `f.doubleBranch`, for example reading the index or length of a node list, are now compile errors that suggest using `if`/`else` instead.
  - More than 100 node graph variables in a single node graph, the editor limit, is now a compile error. Variables generated by gsts count toward the limit. This limit comes from the editor itself; gsts now only reports it.
- Timer fixes:
  - Fixed `clearTimeout(h)` after `const h = setTimeout(...)` failing to cancel the timer in events such as When Attacked or signal events, and possibly stopping a different timer instead.
  - Fixed only the last timer taking effect when `setTimeout` was used inside list callbacks such as `forEach`.
  - Timer names now carry the last 5 digits of the node graph ID, so different node graphs attached to the same entity no longer share timers of the same name and trigger each other. If your code compares timer name strings directly, it needs to be adjusted; this is rare and usually not a concern.
  - Timers with no delay or a delay of 0, such as `setTimeout(() => {})`, now use at least 10ms. Previously such timers never ran.
- Fixed #22, where modifying a list inside the loop body, or a data source changing at run time, made list iteration behave differently from JavaScript. Results such as entity queries are now stored in a local variable when they are read more than once, instead of being queried again on each read, which fixes cases like indices shifting when reading by index after destroying entities.
- Node call parameters now accept the mode-specific (Beyond Mode / Classic Mode) entity types provided by event parameters, so passing them no longer causes type errors.
- Applying JavaScript operations to runtime values inside an ordinary compile-time function now produces a clear message suggesting a `gstsServer` function, instead of the obscure "Generic parameter not matched" error later on.
- With optimization enabled, branches whose condition is a boolean literal are now simplified directly. Thanks to @yanyvpingsheng.
- Added the `gsts analyze` command for inspecting the counts of each kind of node and wire in generated node graphs. Thanks to @yanyvpingsheng.
- Improved automatic layout: nodes are no longer stacked at fixed intervals, and are now placed around each other based on their estimated sizes. Thanks to @yanyvpingsheng.
- ESLint now reports destructuring in node graphs, #19.
- Other subtle fixes and adjustments.

## v0.2.3

- Map injection now supports the new map directory structure introduced in Genshin Impact 7.1.
- Improved compilation and injection performance, making large projects roughly twice as fast as in the previous release. With the optimizations across recent releases, overall compilation performance is now approximately 170% higher than in v0.1.

TypeScript compilation and type hints for the client-side Lua widget scripts introduced in 7.1 will be added in a future update.

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
