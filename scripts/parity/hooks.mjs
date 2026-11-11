const shim = new URL('./shim.mjs', import.meta.url).href

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'genshin-ts' || specifier.startsWith('genshin-ts/')) {
    return { url: shim, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
