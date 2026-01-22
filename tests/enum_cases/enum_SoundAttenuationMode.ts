import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED enum coverage for SoundAttenuationMode
// Run: npx tsx scripts/generate-enum-gia-tests.ts

g.server({ id: 1073741854 }).on('whenEntityIsCreated', (_evt, f) => {
  const e = f.getSelfEntity()
  const pe = f.getListOfPlayerEntitiesOnTheField()[0]
  const ce = f.getAllCharacterEntitiesOfSpecifiedPlayer(pe)[0]
  f.addSoundEffectPlayer(e, 1n, 1n, 1.25, true, 1.25, true, 1.25, E.SoundAttenuationMode.LinearAttenuation, "s", [1,2,3])
  f.addSoundEffectPlayer(e, 1n, 1n, 1.25, true, 1.25, true, 1.25, E.SoundAttenuationMode.FastThenSlow, "s", [1,2,3])
  f.addSoundEffectPlayer(e, 1n, 1n, 1.25, true, 1.25, true, 1.25, E.SoundAttenuationMode.SlowThenFast, "s", [1,2,3])
})
