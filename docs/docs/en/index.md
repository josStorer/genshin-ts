---
pageType: home

hero:
  text: Genshin-TS
  tagline: Use Typescript to develop Genshin UGC - Miliastra Wonderland
  actions:
    - theme: brand
      text: Docs
      link: /doc/overview/intro
    - theme: alt
      text: Template Guide
      link: https://github.com/josStorer/genshin-ts/blob/master/create-genshin-ts/templates/_shared/README.md
    - theme: alt
      text: GitHub
      link: https://github.com/josStorer/genshin-ts
  image:
    src: /rspress-icon.png
    alt: Logo
features:
  - title: TypeScript -> NodeGraph
    details: Write logic in TypeScript, generate control-flow wiring (break/continue/return), compile to graphs, and inject into maps; supports function reuse.
    icon: TS
  - title: AI-friendly Type System
    details: Bilingual aliases, rich annotations, entity subtypes and parameter validation, plus ESLint constraints.
    icon: AI
  - title: JS/Unity API and npm
    details: Supports JS-native and Unity-style APIs, npm ecosystem, and globals like self/stage/player(1).character.
    icon: API
  - title: JS-style Timers
    details: setTimeout/setInterval with automatic closure capture, on-demand name pools, and dispatch aggregation.
    icon: Timer
  - title: Readable Intermediates
    details: .gs.ts/.json/.gia traceability, plus IR JSON as a portable format for tooling.
    icon: IR
  - title: Resource and Enum IDs
    details: Built-in prefab/resource IDs and enum IDs for quick referencing.
    icon: ID
  - title: CLI Tooling
    details: build/dev/inject/maps/backup with parallel and incremental compile, safety checks, and auto backups.
    icon: CLI
  - title: Compile Optimizations
    details: Constant precompute, dead node removal, local variable reuse.
    icon: Opt
---
