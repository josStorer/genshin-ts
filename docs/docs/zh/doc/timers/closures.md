# 闭包捕获

- 定时器回调支持捕获局部变量（按值）。
- 回调内的嵌套回调同样参与捕获分析（按值）。
- 回调内对捕获变量的更新（赋值、列表变异）遵循 JS 直觉；在 interval 下可跨 tick 保持状态。
- 不支持捕获字典类型。
- 回调里不能直接读外层事件参数（如 `evt.attackerEntity`），编译会报错：回调执行时那个事件已经结束。请在 setTimeout/setInterval 之前先存进常量，回调里用这个常量；要读定时器事件本身，请给回调声明参数，例如 `(timer) => timer.timerName`。
- ESLint 的 `gsts/timer-outer-capture` 会提前警告直接读取外层事件的写法。`type Event = typeof evt` 只引用类型，不会警告，也不影响编译。
- 顶层变量读写不会走捕获流程，可用于配置/预计算。
