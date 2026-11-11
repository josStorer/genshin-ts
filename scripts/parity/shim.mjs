// Plain JavaScript stand-in for the gsts server runtime, used to produce the expected output of a
// graph source. Only what the parity fixtures use is implemented; anything else fails loudly.

const graphs = []

const write = (text) => process.stdout.write(`${text}\n`)

const clone = (value) => (Array.isArray(value) ? [...value] : value)

class GraphDict {
  #map
  constructor(entries = []) {
    this.#map = new Map(entries)
  }
  get(key) {
    return this.#map.get(key)
  }
  set(key, value) {
    this.#map.set(key, value)
  }
  has(key) {
    return this.#map.has(key)
  }
  delete(key) {
    this.#map.delete(key)
  }
  keys() {
    return [...this.#map.keys()]
  }
  values() {
    return [...this.#map.values()]
  }
  get size() {
    return this.#map.size
  }
  forEach(callback) {
    for (const [key, value] of this.#map) callback(value, key)
  }
}

function graphFunctions(variables) {
  const known = {
    printString: (text) => write(text),
    getListLength: (xs) => BigInt(xs.length),
    get: (name) => variables[name],
    set: (name, value) => {
      variables[name] = value
    },
    getNodeGraphVariable: (name) => ({
      asType: () => variables[name],
      asDict: () => variables[name]
    }),
    setNodeGraphVariable: (name, value) => {
      variables[name] = value
    }
  }
  return new Proxy(known, {
    get(target, name) {
      if (name in target) return target[name]
      throw new Error(`f.${String(name)} is not implemented in the Node reference runtime`)
    }
  })
}

const str = (value) => {
  if (typeof value === 'bigint' || typeof value === 'string') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return String(value)
  throw new Error(`str(): unsupported value ${String(value)}`)
}

Object.assign(globalThis, {
  print: (text) => write(text),
  str,
  int: (value) => (typeof value === 'bigint' ? value : BigInt(Math.trunc(Number(value)))),
  float: (value) => Number(value),
  bool: (value) => Boolean(value),
  list: (_type, values = []) => [...values],
  dict: (pairs = []) => new GraphDict(pairs.map(({ k, v }) => [k, v]))
})

export const g = {
  server(config) {
    const variables = {}
    for (const [name, value] of Object.entries(config.variables ?? {}))
      variables[name] = clone(value)
    const graph = {
      on(event, handler) {
        graphs.push({ config, event, handler, f: graphFunctions(variables) })
        return graph
      },
      onSignal() {
        return graph
      }
    }
    return graph
  }
}

export function runCreatedHandlers() {
  for (const { config, event, handler, f } of graphs) {
    if (event !== 'whenEntityIsCreated') {
      process.stderr.write(`[skip] graph ${config.id}: ${event} is not simulated\n`)
      continue
    }
    globalThis.gsts = { f }
    handler({}, f)
  }
}
