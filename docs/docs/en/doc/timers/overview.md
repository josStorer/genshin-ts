# Timers

- `setTimeout` / `setInterval` are in milliseconds.
- A 0-second timer never fires in game. A literal delay below 10ms (or no delay) becomes 10ms; a delay computed at run time is left as is, so if it can be 0 the callback may never run.
- Compiler builds name pools to avoid collisions.
- `// @gsts:timerPool=4` overrides pool size.
- Captured timer handles can be passed to `clearTimeout/clearInterval` inside timer callbacks (including non-self handles).
- `setInterval` <= 100ms triggers a warning.
