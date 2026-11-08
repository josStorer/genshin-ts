# Compile-time Issues

- gstsServer return rule violations
- Unsupported APIs (JSON/Object/Promise)
- Non-boolean conditions
- More than 100 node graph variables in one graph (the editor limit, including the `__gsts` variables gsts generates for timers and similar)
- A data wire crosses event handlers; see [Scope](../writing/scope.md)
- Files merged into one graph share a function that starts a timer; see [Multi-entry and Merge](../events/merge.md)
- Warning: an exposed variable holds entities, which the editor cannot fill in; use a GUID instead, see [g.server Options and Entry](../events/gserver.md)
