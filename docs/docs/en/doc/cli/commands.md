# CLI Commands

- `gsts build`
- `gsts dev`
- `gsts inject`
- `gsts maps`
- `gsts open map` / `gsts open backup`

## Inspect a generated graph

`gsts analyze dist/example.json` prints a JSON report for one IR document or an array of
documents. It reads the supplied file without compiling or injecting a map. The report
includes counts by node type, execution/data connections, and node IDs to review for
loops, branches, local-variable operations, timers, list assembly, collection local-variable
writes (possible snapshots) and shared data outputs.
Counts describe the input IR, not runtime timings or guaranteed final GIA node counts.
