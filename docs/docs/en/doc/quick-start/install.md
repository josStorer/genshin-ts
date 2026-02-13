# Install

## Recommended
```bash
npm create genshin-ts@latest
```

genshin-ts includes a TypeScript plugin for more advanced TypeScript support enhancements; even if it is not enabled, it does not affect functionality or development workflow, but enabling it is recommended. See:
`https://gsts.moe/doc/quick-start/install.html#typescript-plugin`

## Requirements
- Node.js (LTS recommended)
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

## Next
Read the template README first.
