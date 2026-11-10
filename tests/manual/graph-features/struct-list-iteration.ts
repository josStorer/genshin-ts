import { g } from 'genshin-ts/runtime/core'
import type { struct } from 'genshin-ts/runtime/value'

function gstsServerEachStruct(xs: struct[]) {
  for (const s of xs) print('item')
}

function gstsServerStructSource(xs: struct[]): struct[] {
  return xs
}

g.server({ id: 1073742400 }).on('whenEntityIsCreated', (_evt, f) => {
  for (const s of f.getNodeGraphVariable('structs').asType('struct_list')) {
    f.printString('item')
  }
})

g.server({ id: 1073742401 }).on('whenEntityIsCreated', (_evt, f) => {
  gstsServerEachStruct(f.getNodeGraphVariable('structs').asType('struct_list'))
})

g.server({ id: 1073742402 }).on('whenEntityIsCreated', (_evt, f) => {
  const structs = gstsServerStructSource(f.getNodeGraphVariable('structs').asType('struct_list'))
  for (const s of structs) f.printString('item')
})

function gstsServerEachUnknown(xs: unknown[]) {
  for (const s of xs) print('item')
}

g.server({ id: 1073742403 }).on('whenEntityIsCreated', (_evt, f) => {
  gstsServerEachUnknown(f.getNodeGraphVariable('structs').asType('struct_list'))
})
