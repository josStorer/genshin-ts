# Template Structure

`npm create genshin-ts@latest` offers two templates with the same layout; "Node graphs + Lua" adds `src/lua`:

```text
src/
  graphs/main.ts        server node graph entry
  shared/constants.ts   shared constants
  resources/            generated from the map when inject is configured (signals, prefabs)
  lua/                  "Node graphs + Lua" only: client control scripts with their own tsconfig
gsts.config.ts          compile and injection config
dist/                   build outputs
```

In the created project, `README.md` covers the full workflow and constraints; the "Node graphs + Lua" template also lists the editor setup needed before the first run (controls, signal and mounting).

To add Lua to a "Node graphs only" project later, see [Adding Lua to an existing project](../lua.md#add-lua).
