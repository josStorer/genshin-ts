# Closures

- Timer callbacks capture local variables by value.
- Nested callbacks inside the timer callback are also included in capture analysis (by value).
- Updates to captured variables (assignment and list mutation) follow normal JS intuition; interval callbacks keep state across ticks.
- Dict captures are not supported.
- Top-level variables are not captured and can be used for config/precompute.
