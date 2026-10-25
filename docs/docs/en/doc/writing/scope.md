# Scope Split

## Top-level scope (compile time)

- File I/O, npm usage, precompute.
- Top-level code may run multiple times.

## Node graph scope (runtime)

- Only a supported TS subset.
- Code inside `g.server().on(...)` and `gstsServer*` is compiled.
- Other ordinary functions run at compile time: they can precompute with literals or receive `f` and call node functions, but cannot apply JS operations (`*`, `+`, `<`, `Number()` and so on) to runtime values; the build reports that and suggests a `gstsServer` function instead.

## Tips

- `raw(...)` tells the compiler to skip processing and use JS semantics.
- `stage.set` can be used as a global variable store.
