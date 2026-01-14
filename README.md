<p align="center">
<img width="256" height="256" alt="logo" src="https://github.com/user-attachments/assets/a1000ae8-8633-449f-9b90-fd3c5da8c4a2" />
</p>
<h1 align="center">Genshin-TS</h1>

<div align="center">

Use TypeScript to develop Genshin UGC (Miliastra Wonderland) projects. Full type system, practical helpers, JS-native and Unity3D-style APIs, npm ecosystem support, and an AI-friendly workflow.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/josStorer/genshin-ts/blob/master/LICENSE)
[![release](https://img.shields.io/github/release/josStorer/genshin-ts.svg)](https://github.com/josStorer/genshin-ts/releases/latest)
[![downloads](https://img.shields.io/npm/dm/genshin-ts.svg)](https://www.npmjs.com/package/genshin-ts)
[![typescript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

English · [简体中文](README_ZH.md)

[Docs](https://gsts.moe) · [Intro Video](https://www.youtube.com/watch?v=kEACvJzHwr0) · [Template Guide & Usage Details](create-genshin-ts/templates/start/README.md)

</div>

## Introduction

Genshin-TS (gsts) is a toolchain for building Miliastra Wonderland projects in TypeScript. It focuses on a code-first experience with controllable node-graph semantics, supporting compilation, injection, debugging, optimization, parallel builds, and incremental builds.

## Quick Start

```bash
npm create genshin-ts
```

Then in the template:

```bash
npm install
npm run dev
```

For detailed usage and constraints, see the template guide and docs:
- [`create-genshin-ts/templates/start/README.md`](create-genshin-ts/templates/start/README.md)
- [https://gsts.moe](https://gsts.moe)

## Highlights

- TS -> NodeGraph compilation: event entry points, control flow, reusable functions.
- Full type hints with Chinese/English aliases: events, functions, APIs, entity subtypes.
- `g.server(...).on(...)` chaining, multi-entry merge by identical ID.
- `gstsServer*` function compilation (reusable logic, controlled returns).
- JS-style timers: `setTimeout` / `setInterval` + closure capture + name pools + dispatch aggregation.
- Compile-time optimizations: constant precompute, dead node removal, local variable reuse.
- Readable IR JSON for debugging and further processing.
- CLI toolchain: incremental builds, injection safety checks, map discovery, auto backups.
- Custom ESLint rules to surface semantic constraints early.
- Built-in prefab/resource ID support.

## Compilation Pipeline and Outputs

Pipeline:
1. TS -> `.gs.ts` (node function call form)
2. `.gs.ts` -> IR `.json` (nodes and connections)
3. IR -> `.gia` (injectable output)

Outputs are written to `dist/` by default. `.gs.ts` and `.json` are the primary debugging entry points.

## Key Optimizations

Enabled by default (can be disabled in `gsts.config.ts`):
- `precompileExpression`: precompute literal-only expressions.
- `removeUnusedNodes`: remove unused exec/data nodes.
- `timerPool`: timer name pools to avoid collisions.
- `timerDispatchAggregate`: aggregate timer dispatch to reduce graph complexity.

## How to Use

- **Template**: `npm create genshin-ts` (recommended)
- **As a dependency**: `npm i genshin-ts` and call compiler/injector APIs in your project
- **Global CLI**: `npm install -g genshin-ts`, then use `gsts` for compile/inject

## Constraints (Overview)

- Only a supported TS subset (no Promise/async/recursion).
- Conditions must be boolean.
- `gstsServer*` allows only a single trailing return.
- `console.log` supports only one argument (rewritten to `print(str(...))`).
- Native `Object.*` / `JSON.*` are generally unavailable in node-graph scope.

See the template guide for the full list and best practices.

## Detailed Usage & AI Guidance

- Template guide: `create-genshin-ts/templates/start/README.md`
- AI guidance: `create-genshin-ts/templates/start/CLAUDE.md` / `create-genshin-ts/templates/start/AGENTS.md`
- Function/event notes: `node_modules/genshin-ts/dist/src/definitions/`

## TODO (Some items may be dropped based on feasibility; in no particular order)

- Improve CI pipeline
- Add client-side node graph support
- Improve documentation site
- Signal and struct definitions with parameter passing (generic parameter type hints)
- Auto-detect node graph limit overflow (3000)
- Auto re-inject on external map save detection
- `g.scene()` programmatic scene definition support
- Auto variable mounting support
- Node graph JSON visual previewer
- Programmatic struct and global timer definitions
- More `// @gsts:` decorator optimization flags, e.g., local precompile toggle
- `await delay` support? (highly uncertain)
- GIA to TypeScript conversion support
- npm library development template
- Generate JS source maps for better error tracing
- Fix cross-file duplicate ID level cache issues
- JSX component development abstraction
- Expand examples
- Simplify `{}` style 3D vector array inference
- Extract custom prefab IDs from GIL directly into project
- VFX, sound, and other resource IDs

## Special Thanks

- https://github.com/Wu-Yijun/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack

- Before discovering this project, I spent nearly a month reversing GIA/GIL; their approach was more complete. I integrated it as a third-party module and merged some of my reverse-engineered data.

- The work is excellent and MIT-licensed. Please consider supporting the project as well.
