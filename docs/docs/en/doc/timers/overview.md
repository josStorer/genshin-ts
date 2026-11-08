# Timers

- `setTimeout` / `setInterval` are in milliseconds.
- A 0-second timer never fires in game. A literal delay below 10ms (or no delay) becomes 10ms; a delay computed at run time is left as is, so if it can be 0 the callback may never run.
- Compiler builds name pools to avoid collisions. Timer names end with the last 5 digits of the graph ID (for example `__gsts_timeout_3_0_41921`): timers are told apart by name and their trigger reaches every graph mounted on the entity, so with the graph ID in the name, graphs on the same entity no longer restart or trigger each other's timers.
- `// @gsts:timerPool=4` overrides pool size.
- Captured timer handles can be passed to `clearTimeout/clearInterval` inside timer callbacks (including non-self handles).
- `setInterval` <= 100ms triggers a warning.
