# Optimize Options

- `precompileExpression`
- `removeUnusedNodes`
- `timerPool`
- `timerDispatchAggregate`

Disable in `gsts.config.ts` if needed.

When both `precompileExpression` and `removeUnusedNodes` are enabled, server graphs also
bypass `double_branch` nodes whose condition is a literal boolean. Unreachable execution
nodes and data used only by those nodes are then removed. Runtime-dependent conditions
are kept. Both callbacks still run at graph-construction time; this optimization changes
the emitted graph, not JavaScript construction side effects. Disable either option to
preserve the original branch structure for debugging. Client graphs are unchanged.

Use `gsts analyze dist/example.json` to inspect the resulting IR. The report lists node
types, connections, and node IDs for branches, loops, local variables, timers, list assembly,
collection local-variable writes (possible snapshots),
and shared data outputs. These are static review points, not measured execution counts
or timing estimates. In particular, sharing a data output does not guarantee that the
game evaluates it only once. Later IR-to-GIA transforms can change the final node counts.

Automatic layout reserves explicit IR `position` values before placing other nodes.
Execution, data and detached nodes share conservative footprint spacing, with extra
height for input arguments. Positions are deterministic for the same IR. These footprints
are estimates rather than measured editor dimensions; explicit positions take precedence,
including when two manually positioned nodes overlap.
