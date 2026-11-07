import { g } from 'genshin-ts/runtime/core'

// One transformed helper is expanded in two graphs attached to the same entity.
function gstsServerSharedTimer(value: bigint) {
  const handle = setInterval(() => {
    print(str(value))
    clearInterval(handle)
  }, 1000)
  setTimeout(() => {
    print(str(value))
    clearInterval(handle)
  }, 2000)
  return handle
}

g.server({ id: 1073741921 }).on('whenEntityIsCreated', (_evt, f) => {
  const value = f.addition(1n, 2n)
  const handle = gstsServerSharedTimer(value)
  clearTimeout(handle)
  f.startTimer(f.getSelfEntity(), 'manual_timer', false, [1.5])
  // A user-supplied name resembling generated names must still remain unchanged.
  f.startTimer(f.getSelfEntity(), '__gsts_timeout_999_0', false, [1.5])
})
g.server({ id: 1073741922 }).on('whenEntityIsCreated', (_evt, f) => {
  gstsServerSharedTimer(f.addition(3n, 4n))
})
