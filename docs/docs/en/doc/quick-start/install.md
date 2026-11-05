# Install

## Recommended

```bash
npm create genshin-ts@latest
```

> If the Windows execution policy prevents scripts from running, replace `npm` with `npm.cmd` in all commands.

Use the arrow keys and Enter to go through:

1. the project name;
2. the template: **Node graphs + Lua** (recommended) or **Node graphs only**; see [Template Structure](./template.md);
3. the map to inject into: local map saves are found automatically; pick the region, account (user ID) and map as needed and they are written to `inject` in `gsts.config.ts`. You can also skip this;
4. whether to install dependencies now.

Prompts follow the system language; pass `--lang zh` or `--lang en` to choose. Where arrow keys are not available (CI, for example), pass everything as options and nothing is asked:

```bash
npm create genshin-ts@latest my-world -- --template graph-lua --yes
npm create genshin-ts@latest my-world -- --template graph --region China --player 100000000 --map 1073741825 --install
```

Run `npm create genshin-ts@latest -- --help` for every option.

genshin-ts includes a TypeScript plugin for more advanced TypeScript support enhancements; even if it is not enabled, it does not affect functionality or development workflow, but enabling it is recommended. See:
`https://gsts.moe/doc/quick-start/install.html#typescript-plugin`

## Requirements

- Node.js 20.19+ or 22+ (LTS recommended)
- Windows (map injection paths)

## TypeScript Plugin

- genshin-ts includes a TypeScript Language Service plugin for enhanced TypeScript support.
- Even if the plugin is not enabled, it does not affect project build, runtime behavior, or overall type-system experience, but enabling it is recommended for more advanced TypeScript support enhancements.
- Most mainstream editors support it, and JetBrains IDEA is usually zero-config.
- In VSCode/Cursor, when you open a project created by `npm create genshin-ts@latest`, you will usually see:
  - `"This workspace contains a TypeScript version. Do you want to use the workspace TypeScript version for TypeScript and JavaScript language features?"`
  - Choose allow/confirm workspace TypeScript so the plugin can take effect.
- If the prompt does not appear, configure/check:
  - `"typescript.tsdk": "node_modules/typescript/lib"`
  - `"typescript.enablePromptUseWorkspaceTsdk": true`
  - Then run: `TypeScript: Select TypeScript Version` -> `Use Workspace Version`
- What the plugin improves, what happens without it, how to pick up an upgrade and how to troubleshoot: see [TypeScript Plugin](./ts-plugin.md).

## Next

Read the template README first.
