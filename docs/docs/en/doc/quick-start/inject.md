# Injection and Maps

## Injection config
Set `inject` in `gsts.config.ts`:
- `gameRegion` / `playerId`
- `mapId` / `nodeGraphId`
- `reinjectOnMapChange` (auto re-inject on map save in dev mode, enabled by default)
- `extractResources` (auto extract custom resources, enabled by default)
- `resourcesPath` (custom resources output path, default `src/resources/prefabs.ts`)

## Safety checks
- Target graph must exist and be empty or start with `_GSTS`.
- Use `inject.skipSafeCheck = true` only if you know the risks.

## Apply changes
- Reload the map after injection.
- Use a temporary empty map to swap quickly and force reload.
- Saving the map before reloading overwrites injected content; in dev mode it auto re-injects (enabled by default), otherwise re-inject manually.
- In dev mode, map saves trigger auto re-injection; set `inject.reinjectOnMapChange = false` to disable.
