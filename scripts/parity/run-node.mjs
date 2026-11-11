// Usage: node scripts/parity/run-node.mjs <graph source .ts>
// Runs a graph source as plain JavaScript and prints what the game log is expected to show.

import { register } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const file = process.argv[2]
if (!file) throw new Error('Expected a graph source file')
register('./hooks.mjs', import.meta.url)
const { runCreatedHandlers } = await import('./shim.mjs')
await import(pathToFileURL(path.resolve(file)).href)
runCreatedHandlers()
