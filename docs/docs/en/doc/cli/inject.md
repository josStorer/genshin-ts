# Injection Notes

- Target graph must exist and follow safety rules.
- Reload the map after injection.
- `inject.skipSafeCheck` can disable safety checks.

## Signal Extraction

When `inject` is configured, compilation extracts signal definitions from the target map into `src/resources/signals.ts` by default. The exported `Signal` object enables parameter type hints for `sendSignal(Signal.xxx, ...)` and `onSignal(Signal.xxx, ...)`.

Set `inject.extractSignals: false` to disable extraction, or use `inject.signalsPath` to change the output path.
