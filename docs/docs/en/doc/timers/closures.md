# Closures

- Timer callbacks capture local variables by value.
- Nested callbacks inside the timer callback are also included in capture analysis (by value).
- Updates to captured variables (assignment and list mutation) follow normal JS intuition; interval callbacks keep state across ticks.
- Dict captures are not supported.
- A callback cannot read the outer event parameter (such as `evt.attackerEntity`); this is a compile error, because that event is over by the time the callback runs. Store the value in a constant before setTimeout/setInterval and use the constant in the callback; to read the timer event itself, declare the callback parameter, for example `(timer) => timer.timerName`.
- Top-level variables are not captured and can be used for config/precompute.
