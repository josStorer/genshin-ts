# 全局函数速查

## 日志
- `print(str(...))`
- `console.log(x)`（单参）
- `f.printString(...)`

## 类型构造
- `raw(...)`（跳过编译器转换）
- `bool/int/float/str`（`int(123)` 可用，但推荐 `123n`）
- `vec3/guid/prefabId/configId/faction/entity`（显式类型字面量；`entity(0)` / `entity(null)` 占位）

## 集合
- `list(t, items)` / `list(t, 0)` 占位
- `dict(k, v, 0)` 占位

## 场景/实体
- `player(1)` / `stage` / `level` / `self`
- `GameObject.Find(...)`

## 其他
- `Math` / `Mathf` / `Vector3` / `Random`
- `send('signal')` / `send(Signal.xxx, ...)` + `onSignal(Signal.xxx, ...)`
- `setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`
