# Scope Split

## Top-level scope (compile time)

- File I/O, npm usage, precompute.
- Top-level code may run multiple times.
- When a top-level `let` gets a runtime value in one event handler and is read in another, the graph would contain a data wire across event handlers. The official risk check flags such wires as passing wrong data, so the build fails and ESLint (`gsts/no-outer-graph-assignment`) warns. Share data between events through node graph variables (`f.set` / `f.get`, `stage.set`), or recompute it in the current event.

## Node graph scope (runtime)

- Only a supported TS subset.
- Code inside `g.server().on(...)` and `gstsServer*` is compiled.
- Other ordinary functions run at compile time: they can precompute with literals or receive `f` and call node functions, but cannot apply JS operations (`*`, `+`, `<`, `Number()` and so on) to runtime values; the build reports that and suggests a `gstsServer` function instead.

## Tips

- `raw(...)` tells the compiler to skip processing and use JS semantics.
- `stage.set` can be used as a global variable store.
