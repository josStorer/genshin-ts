# create-genshin-ts

Scaffold a Genshin-TS project.

## Usage

```bash
npm create genshin-ts@latest
```

> If the Windows execution policy prevents scripts from running, replace `npm` with `npm.cmd` in all commands.

The prompts (Chinese or English, following the system) walk through the project name, the template — **Node graphs + Lua** (recommended) or **Node graphs only** — the map to inject into, found from your local saves, and installing dependencies.

Without arrow keys (CI, for example), pass options instead:

```bash
npm create genshin-ts@latest my-world -- --template graph-lua --yes
npm create genshin-ts@latest my-world -- --template graph --region China --player 100000000 --map 1073741825 --install
```

Run `npm create genshin-ts@latest -- --help` for every option.

genshin-ts includes a TypeScript plugin for more advanced TypeScript support enhancements; even if it is not enabled, it does not affect functionality or development workflow, but enabling it is recommended. See:
[https://gsts.moe/doc/quick-start/install.html#typescript-plugin](https://gsts.moe/doc/quick-start/install.html#typescript-plugin)
