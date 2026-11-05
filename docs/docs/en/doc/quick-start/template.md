# Template Structure

`npm create genshin-ts@latest` offers two templates.

"Node graphs + Lua" (recommended):

```text
src/
  graphs/main.ts        server node graph; receives the signal sent from Lua
  lua/                  client control scripts with their own tsconfig
    hud.ts              Lua entry
    lib/format.ts       ordinary TS module used by the Lua entry
  resources/signals.ts  signal definitions shared by node graphs and Lua
gsts.config.ts          compile and injection config
dist/                   build outputs
```

"Node graphs only":

```text
src/
  main.ts               node graph entry
  resources/            generated from the map when inject is configured (signals, prefabs)
gsts.config.ts          compile and injection config
dist/                   build outputs
```

In the created project, `README.md` covers the full workflow and constraints; the "Node graphs + Lua" template also lists the editor setup needed before the first run (control, signal and mounting).

To add Lua to a "Node graphs only" project later, see [Adding Lua to an existing project](../lua.md#add-lua).
