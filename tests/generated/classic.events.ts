import { g } from 'genshin-ts/runtime/core'

// AUTO-GENERATED: classic server events
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741844, mode: 'classic' }).on("whenTheActiveCharacterChanges", (_evt, f) => {
  f.printString("event_whenTheActiveCharacterChanges")
})
