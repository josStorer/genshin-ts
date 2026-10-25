#!/usr/bin/env node

// gsts lua check 走独立的轻量入口：纯 TS 项目把它放进 typecheck 也几乎没有开销
const argv = process.argv.slice(2)
const lua = argv.indexOf('lua')
if (lua >= 0 && argv[lua + 1] === 'check' && !argv.includes('--help') && !argv.includes('-h')) {
  const { runLuaCheck } = await import('../dist/src/cli/lua_check.js')
  process.exitCode = await runLuaCheck(argv)
} else await import('../dist/src/cli/gsts.js')
