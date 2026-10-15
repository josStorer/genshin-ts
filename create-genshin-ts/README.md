# create-genshin-ts

Pass `--with-lua` to add a client Lua subproject, a minimal timer example, and mounting instructions:

```sh
npm create genshin-ts@latest my-world -- --with-lua
```

Without this flag the existing nodegraph template is unchanged. Lua uses its own tsconfig; the default ESLint configuration detects it automatically. File injection does not mount the script in the editor.

Scaffold a Genshin-TS project.

## Usage

```bash
npm create genshin-ts@latest
```

> If the Windows execution policy prevents scripts from running, replace `npm` with `npm.cmd` in all commands.

genshin-ts includes a TypeScript plugin for more advanced TypeScript support enhancements; even if it is not enabled, it does not affect functionality or development workflow, but enabling it is recommended. See:
[https://gsts.moe/doc/quick-start/install.html#typescript-plugin](https://gsts.moe/doc/quick-start/install.html#typescript-plugin)
