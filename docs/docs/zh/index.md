---
pageType: home

hero:
  text: Genshin-TS
  tagline: 使用Typescript进行原神UGC-千星奇域开发
  actions:
    - theme: brand
      text: 文档
      link: /doc/overview/intro
    - theme: alt
      text: 模板文档
      link: https://github.com/josStorer/genshin-ts/blob/master/create-genshin-ts/templates/_shared/README_ZH.md
    - theme: alt
      text: GitHub
      link: https://github.com/josStorer/genshin-ts
  image:
    src: /rspress-icon.png
    alt: Logo
features:
  - title: TypeScript -> NodeGraph
    details: 以 TypeScript 编写逻辑，自动生成控制流连线（break/continue/return），并编译为节点图注入地图，支持函数声明复用。
    icon: TS
  - title: AI 友好类型系统
    details: 中英文别名、完整注释与类型提示，实体子类型区分与参数校验，配套 ESLint 规则。
    icon: AI
  - title: JS/Unity API 与 npm
    details: 支持 JS 原生与 Unity 风格 API，可用 npm 生态，并有 self/stage/player(1).character 等全局入口。
    icon: API
  - title: JS 风格定时器
    details: setTimeout/setInterval + 自动闭包捕获 + 按需名称池 + 聚合分发。
    icon: Timer
  - title: 可读中间产物
    details: .gs.ts/.json/.gia 全流程可追踪；IR JSON 为通用格式，便于外部程序处理与调试。
    icon: IR
  - title: 资源与枚举 ID
    details: 内置元件资源 ID 与枚举 ID 支持，便于快速引用。
    icon: ID
  - title: CLI 工具链
    details: build/dev/inject/maps/backup，支持并行/增量编译、注入安全检查与自动备份。
    icon: CLI
  - title: 编译优化
    details: 常量预计算、无用节点清理、局部变量复用。
    icon: Opt
---
