local M = {}
function M.liveExports(exports, getters)
    setmetatable(exports, {
        __index = function(_, key)
            local get = getters[key]
            if get then return get() end
        end,
        __pairs = function(target)
            local key, readingGetters = nil, false
            return function()
                if not readingGetters then
                    key = next(target, key)
                    if key ~= nil then return key, target[key] end
                    readingGetters, key = true, nil
                end
                repeat key = next(getters, key) until key == nil or rawget(target, key) == nil
                if key ~= nil then return key, getters[key]() end
            end
        end
    })
end
-- JavaScript Boolean conversion; the first slot is the standard callback receiver.
function M.toBoolean(_, value)
    return value ~= nil and value ~= false and value ~= 0 and value ~= "" and value == value
end
function M.multi(...) return ... end
-- A handle to another mount's script: methods.name(...) and Invoke(name, ...) both call the official Invoke.
-- Method callers are cached per name, so repeated calls allocate nothing.
function M.scriptHandle(script)
    if script == nil then return nil end
    local methods = setmetatable({}, {__index = function(cache, name)
        local call = function(...) return script:Invoke(name, ...) end
        rawset(cache, name, call)
        return call
    end})
    return {script = script, methods = methods, Invoke = function(_, name, ...) return script:Invoke(name, ...) end}
end
function M.clamp(value, low, high) return math.min(high, math.max(low, value)) end
function M.lerp(a, b, t) return a + (b - a) * t end
function M.moveTowards(value, target, delta)
    assert(delta >= 0, "maxDelta must be non-negative")
    if math.abs(target - value) <= delta then return target end
    return value + (target > value and delta or -delta)
end
local controlTypes = {
    ClientUIBaseControl=true, ClientUIImageControl=true, ClientUITextBoxControl=true,
    ClientUITextWindowControl=true, ClientUIPresetButtonControl=true, ClientUICursorEventAreaControl=true,
    ClientUIGridScrollerControl=true, ClientUIKeyHintControl=true, ClientUIAnimationControl=true,
    ClientUIFullscreenAnimationControl=true, ClientUIContainerControl=true, ClientUIReferenceControl=true
}
function M.isControl(control, kind)
    if control == nil then return false end
    local actual = typeof(control)
    return actual == kind or (kind == "ClientUIBaseControl" and controlTypes[actual] == true)
end
function M.findControl(root, path, kind)
    local current = root
    for part in string.gmatch(path, "[^/]+") do
        local found = nil
        for _, child in ipairs(current:GetChildren()) do
            if child.name == part then
                if found then error("Control path is ambiguous: " .. path) end
                found = child
            end
        end
        if not found then return nil end
        current = found
    end
    if not M.isControl(current, kind) then error("Unexpected control type at " .. path .. ": " .. typeof(current)) end
    return current
end
function M.requireControl(root, path, kind)
    local result = M.findControl(root, path, kind)
    if not result then error("Control not found: " .. path) end
    return result
end
-- The compiler passes the entry's script path, derived from findScript<typeof Entry>.
function M.findScript(scriptPath, control, path)
    if control ~= nil and path ~= nil then control = M.findControl(control, path, "ClientUIBaseControl") end
    if control == nil then return nil end
    return M.scriptHandle(control:GetScriptByPath(scriptPath))
end
function M.requireScript(scriptPath, control, path)
    if control == nil then error("Script " .. scriptPath .. " not found: the control is nil") end
    if path ~= nil then control = M.requireControl(control, path, "ClientUIBaseControl") end
    local handle = M.scriptHandle(control:GetScriptByPath(scriptPath))
    if handle == nil then error("Script " .. scriptPath .. " is not mounted on " .. (path or control.name)) end
    return handle
end
-- The host expects a boolean: true marks the key event as handled. No return value means not handled.
function M.listenKey(control, event, callback)
    local handler = function() return callback() == true end
    control:AddKeyEventListener(event, handler)
    local listening = true
    return function()
        if not listening then return end
        listening = false
        if control.alive then control:RemoveKeyEventListener(event, handler) end
    end
end
function M.listenCursor(control, event, callback)
    control:AddCursorEventListener(event, callback)
    local listening = true
    return function()
        if not listening then return end
        listening = false
        if control.alive then control:RemoveCursorEventListener(event, callback) end
    end
end
function M.defineSignal(name, params) return {__gstsSignal = true, name = name, params = params} end
local signalKinds = require("__gsts_signal_kinds")
local validators = {}
-- Every numeric category rejects NaN and infinities before narrower checks.
function validators.float(value)
    return type(value) == "number" and value == value and math.abs(value) ~= math.huge
end
-- Integers preserve the shared contract's exact, safe numeric range.
-- Confirmed in game (2026-10-24): AddInt sends 2.0 as 2, but silently sends 1.5 as 0.
function validators.integer(value)
    return validators.float(value) and value % 1 == 0 and math.abs(value) <= 9007199254740991
end
function validators.string(value) return type(value) == "string" end
function validators.boolean(value) return type(value) == "boolean" end
-- Vectors use the same finite-number check as scalar floats.
function validators.vec3(value)
    return type(value) == "table" and validators.float(value.x)
        and validators.float(value.y) and validators.float(value.z)
end
-- Select the validation category once; each list loop checks values inline without per-item calls.
local function validSignalValue(kind, value)
    local spec = signalKinds[kind]
    if not spec then return false end
    if not spec.list then return validators[spec.validation](value) end
    if type(value) ~= "table" then return false end
    local length, count = #value, 0
    if spec.validation == "integer" then
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > length then return false end
            if type(item) ~= "number" or item % 1 ~= 0 or item < -9007199254740991 or item > 9007199254740991 then return false end
            count = count + 1
        end
    elseif spec.validation == "float" then
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > length then return false end
            if type(item) ~= "number" or item ~= item or item == math.huge or item == -math.huge then return false end
            count = count + 1
        end
    elseif spec.validation == "string" then
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > length then return false end
            if type(item) ~= "string" then return false end
            count = count + 1
        end
    elseif spec.validation == "boolean" then
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > length then return false end
            if type(item) ~= "boolean" then return false end
            count = count + 1
        end
    elseif spec.validation == "vec3" then
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > length then return false end
            if type(item) ~= "table" then return false end
            local x = item.x
            if type(x) ~= "number" or x ~= x or x == math.huge or x == -math.huge then return false end
            local y = item.y
            if type(y) ~= "number" or y ~= y or y == math.huge or y == -math.huge then return false end
            local z = item.z
            if type(z) ~= "number" or z ~= z or z == math.huge or z == -math.huge then return false end
            count = count + 1
        end
    else return false end
    return count == length
end

-- The send and receive boundaries reject the same count, index and value errors.
local function signalValueError(signal, values, count)
    if type(values) ~= "table" or (count or #values) ~= #signal.params then
        return "Invalid signal payload: " .. signal.name .. " (parameter count)"
    end
    local actual = 0
    for key in pairs(values) do
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #signal.params then
            return "Invalid signal payload: " .. signal.name .. " (parameter index)"
        end
        actual = actual + 1
    end
    for i, param in ipairs(signal.params) do
        if not validSignalValue(param[2], values[i]) then
            return "Invalid signal payload: " .. signal.name .. "." .. param[1]
        end
    end
    if actual ~= #signal.params then return "Invalid signal payload: " .. signal.name .. " (parameter count)" end
end
-- Validate the entire payload before creating a host signal or writing any fields.
function M.send(signal, ...)
    local values = {...}
    local message = signalValueError(signal, values, select('#', ...))
    if message then error(message, 2) end
    local instance = game.ServerSignal(signal.name)
    for i, param in ipairs(signal.params) do
        instance[signalKinds[param[2]].writer](instance, values[i])
    end
    instance:SendSignal()
end
M.console = {}
function M.console.log(...) print(...) end
M.console.info = M.console.log
function M.console.warn(...) print("[warn]", ...) end
function M.console.error(...) printerr(...) end
function M.console.assert(condition, ...) if not condition then printerr("Assertion failed", ...) end end
function M.console.trace(...) print(...); print(debug.traceback()) end
function M.readParams(script, schema)
    local values = {}
    for name, spec in pairs(schema) do
        local value = script:GetParam(name)
        if value == nil then value = spec.default end
        if type(value) ~= spec.type then
            error("Script parameter " .. name .. " must be " .. spec.type .. ", got " .. type(value))
        end
        values[name] = value
    end
    return values
end
-- Confirmed in game (2026-10-22): EnableUpdate(false) stops both update hooks.
-- Level timers therefore need the host update switch even when user OnUpdate is disabled.
local LEVEL_CLOCK_NEEDS_UPDATE = true

-- One scope belongs to one mount. The ordered list owns every external subscription.
function M.createScope(env, clock)
    local scope, groups, subscriptions = {wantsUpdate=false}, {}, {}
    -- Legal: idle -> active/inactive/destroyed; active <-> inactive; either -> destroyed.
    -- Repeating a state change and activating a destroyed scope are ignored.
    local state = "idle"
    local queues = {real={now=0,tasks={},order={}}, level={now=0,tasks={},order={}}}
    local owners = {}
    local userWantsUpdate, actualUpdate = false, false
    -- The host switch belongs to the scope; timer demand never changes user intent.
    local function syncUpdate()
        scope.wantsUpdate = state == "active" and userWantsUpdate
        local timerNeedsUpdate = queues.real.nextDue ~= nil
            or (LEVEL_CLOCK_NEEDS_UPDATE and queues.level.nextDue ~= nil)
        local enabled = state == "active" and (userWantsUpdate or timerNeedsUpdate)
        if enabled ~= actualUpdate then
            actualUpdate = enabled
            env.script:EnableUpdate(enabled)
        end
    end
    -- Generated user OnUpdate reads wantsUpdate directly; syncUpdate keeps it current.
    -- Only calls targeting the current script are redirected here by the compiler.
    function scope.enableUpdate(enabled)
        userWantsUpdate = enabled
        syncUpdate()
    end

    -- Stop hooks rethrow user errors after cleanup; capture the stack where the error was raised.
    -- TSTL Error objects already record their own stack and are passed through unchanged.
    function scope.traceback(message)
        if type(message) == "string" and debug and debug.traceback then return debug.traceback(message, 2) end
        return message
    end

    -- Reporting a callback failure does not abort the remaining subscribers.
    local function report(message) env.printerr("[GSTS] " .. tostring(message)) end
    -- Cleanup is best-effort for each subscription, so one host error cannot skip the others.
    local function safe(fn, ...)
        local ok, message = pcall(fn, ...)
        if not ok then report(message) end
    end
    -- Every subscription provides activate/deactivate/dispose, and is disposed at most once.
    local function subscribe(subscription)
        subscriptions[#subscriptions + 1] = subscription
        if state == "active" then subscription.activate() end
        return function()
            if subscription.disposed then return end
            subscription.disposed = true
            safe(subscription.dispose)
            for i, item in ipairs(subscriptions) do
                if item == subscription then table.remove(subscriptions, i); break end
            end
        end
    end
    -- Iteration uses a snapshot: host callbacks may cancel another subscription synchronously.
    local function visitSubscriptions(operation)
        local snapshot = {}
        for i, item in ipairs(subscriptions) do snapshot[i] = item end
        for _, item in ipairs(snapshot) do
            if operation == "activate" and state ~= "active" then break end
            if not item.disposed then
                if operation == "dispose" then item.disposed = true end
                safe(item[operation])
            end
        end
    end

    -- Both clock queues are one subscription and share the mount's lifecycle.
    local timers = {}
    function timers.activate() syncUpdate() end
    -- Inactive ticks do not advance either clock, preserving every remaining delay.
    function timers.deactivate() syncUpdate() end
    -- Destruction clears both queues and invalidates all handles owned by this mount.
    function timers.dispose()
        for _, queue in pairs(queues) do queue.tasks, queue.order, queue.nextDue = {}, {}, nil end
        owners = {}
        syncUpdate()
    end
    if clock then subscribe(timers) end

    -- Each task belongs to exactly one clock; inactive time never advances its delay.
    local function schedule(callback, delay, repeated, timerClock, ...)
        if state == "destroyed" then error("Cannot schedule a timer on a destroyed script") end
        local queue = queues[timerClock]
        delay = delay or 0
        -- TS checks callback/clock types; computed delays still need a finite-number check.
        if delay ~= delay or math.abs(delay) == math.huge then
            error("Timer delay must be a finite number of milliseconds, got " .. tostring(delay))
        end
        delay = math.max(0, delay)
        local handle = {}
        queue.tasks[handle] = {callback=callback, delay=delay, due=queue.now+delay, repeated=repeated, args={n=select('#',...),...}}
        queue.order[#queue.order+1] = handle
        local due = queue.tasks[handle].due
        if queue.nextDue == nil or due < queue.nextDue then queue.nextDue = due end
        owners[handle] = queue
        syncUpdate()
        return handle
    end
    -- Global timers use the entry's clock; explicit helper timers select their own queue.
    function scope.setTimeout(callback, delay, ...) return schedule(callback, delay, false, clock, ...) end
    function scope.setInterval(callback, delay, ...) return schedule(callback, delay, true, clock, ...) end
    function scope.setTimeoutOnClock(callback, delay, timerClock, ...) return schedule(callback, delay, false, timerClock, ...) end
    function scope.setIntervalOnClock(callback, delay, timerClock, ...) return schedule(callback, delay, true, timerClock, ...) end
    -- Handles from either clock can be cancelled, but never a handle owned by another mount.
    function scope.clearTimeout(handle)
        local queue = handle ~= nil and owners[handle]
        if not queue then return end
        local removed = queue.tasks[handle]
        queue.tasks[handle], owners[handle] = nil, nil
        -- Cancelled handles must not accumulate while a distant deadline is pending.
        for i, item in ipairs(queue.order) do if item == handle then table.remove(queue.order, i); break end end
        if removed.due == queue.nextDue then
            queue.nextDue = nil
            for _, task in pairs(queue.tasks) do
                if queue.nextDue == nil or task.due < queue.nextDue then queue.nextDue = task.due end
            end
        end
        syncUpdate()
    end
    scope.clearInterval = scope.clearTimeout
    -- A queue cannot re-enter itself; tasks created during its tick run on a later tick.
    function scope.tick(dt, timerClock)
        local queue = queues[timerClock or clock]
        if state ~= "active" or not queue or queue.ticking or queue.nextDue == nil then return end
        queue.now = queue.now + dt * 1000
        -- Waiting frames only advance the clock and compare the earliest deadline; no tables or scan.
        if queue.now < queue.nextDue then return end
        queue.ticking = true
        local snapshot = {}
        for i, handle in ipairs(queue.order) do snapshot[i] = handle end
        for _, handle in ipairs(snapshot) do
            if state ~= "active" then break end
            local task = queue.tasks[handle]
            if task and task.due <= queue.now then
                if task.repeated then
                    task.due = task.delay > 0 and (queue.now + task.delay - (queue.now - task.due) % task.delay) or queue.now
                else queue.tasks[handle] = nil; owners[handle] = nil end
                local ok, message = pcall(task.callback, table.unpack(task.args, 1, task.args.n))
                if not ok then queue.tasks[handle] = nil; owners[handle] = nil; report(message) end
            end
        end
        local remaining = {}
        queue.nextDue = nil
        for _, handle in ipairs(queue.order) do
            local task = queue.tasks[handle]
            if task then
                remaining[#remaining+1] = handle
                if queue.nextDue == nil or task.due < queue.nextDue then queue.nextDue = task.due end
            end
        end
        queue.order = remaining
        queue.ticking = false
        syncUpdate()
    end

    -- A signal name has one host registration; all listeners share its validated payload.
    function scope.onSignal(signal, callback)
        if state == "destroyed" then error("Cannot subscribe after script destruction") end
        local group = groups[signal.name]
        if not group then
            group = {signal=signal, listeners={}, registered=false}
            groups[signal.name] = group
            -- Activation is idempotent, including when a listener is added while already active.
            function group.activate()
                if group.registered or #group.listeners == 0 then return end
                env.script:RegisterServerSignalHandler(signal.name, group.dispatch)
                group.registered = true
            end
            -- The exact name registered by this group is the only registration it removes.
            function group.deactivate()
                if not group.registered then return end
                group.registered = false
                env.script:UnregisterServerSignalHandler(signal.name)
            end
            -- Old cancellation handles become no-ops after destruction.
            function group.dispose()
                for _, listener in ipairs(group.listeners) do listener.enabled = false end
                group.listeners = {}
                group.deactivate()
            end
            -- Validate before invoking users, and isolate failures between listeners.
            function group.dispatch(name, values)
                if state ~= "active" then return end
                local message = name ~= signal.name and ("Unexpected signal name: " .. tostring(name) .. " (expected " .. signal.name .. ")")
                    or signalValueError(signal, values)
                if message then report(message); return end
                local params = {}
                for i, param in ipairs(signal.params) do params[param[1]] = values[i] end
                local snapshot = {}
                for i, listener in ipairs(group.listeners) do snapshot[i] = listener end
                for _, listener in ipairs(snapshot) do
                    if listener.enabled and state == "active" then safe(listener.callback, {name=name, params=params}) end
                end
            end
            subscribe(group)
        else
            if #group.signal.params ~= #signal.params then error("Conflicting signal contract: " .. signal.name) end
            for i, param in ipairs(signal.params) do
                local previous = group.signal.params[i]
                if previous[1] ~= param[1] or previous[2] ~= param[2] then error("Conflicting signal contract: " .. signal.name) end
            end
        end
        local listener = {callback=callback, enabled=true}
        group.listeners[#group.listeners + 1] = listener
        if state == "active" then group.activate() end
        -- Cancelling one listener leaves the others registered; repeated cancellation is harmless.
        return function()
            if not listener.enabled then return end
            listener.enabled = false
            for i, item in ipairs(group.listeners) do if item == listener then table.remove(group.listeners, i); break end end
            if #group.listeners == 0 then safe(group.deactivate) end
        end
    end
    -- Key and cursor listeners use the same activation and disposal list as signals and the timer queue.
    local function listen(start, control, event, callback)
        if state == "destroyed" then error("Cannot listen after script destruction") end
        local listener = {}
        -- There is never more than one host callback for this subscription.
        function listener.activate() if not listener.off then listener.off = start(control, event, callback) end end
        -- Removal uses the original callback identity, then clears the active handle.
        function listener.deactivate()
            local off = listener.off
            listener.off = nil
            if off then off() end
        end
        listener.dispose = listener.deactivate
        return subscribe(listener)
    end
    function scope.listenKey(control, event, callback) return listen(M.listenKey, control, event, callback) end
    function scope.listenCursor(control, event, callback) return listen(M.listenCursor, control, event, callback) end
    -- A custom variable has one host registration; each listener checks the value type it asked for.
    local variables = {}
    function scope.onVariable(entityType, name, valueType, callback)
        if state == "destroyed" then error("Cannot subscribe after script destruction") end
        local key = tostring(entityType.FullName or entityType) .. "/" .. name
        local group = variables[key]
        if not group then
            group = {listeners={}, registered=false}
            variables[key] = group
            function group.activate()
                if group.registered or #group.listeners == 0 then return end
                env.script:RegisterCustomVariableChangedHandler(entityType, name, group.dispatch)
                group.registered = true
            end
            function group.deactivate()
                if not group.registered then return end
                group.registered = false
                env.script:UnregisterCustomVariableChangedHandler(entityType, name)
            end
            function group.dispose()
                for _, listener in ipairs(group.listeners) do listener.enabled = false end
                group.listeners = {}
                group.deactivate()
            end
            -- The host only reports which variable changed; read its current value once per change.
            function group.dispatch()
                if state ~= "active" then return end
                local value = env.game.GetGlobalCustomVariableValue(entityType, name)
                local snapshot = {}
                for i, listener in ipairs(group.listeners) do snapshot[i] = listener end
                for _, listener in ipairs(snapshot) do
                    if listener.enabled and state == "active" then
                        if type(value) == listener.valueType then safe(listener.callback, value)
                        else report("Custom variable " .. name .. " must be " .. listener.valueType .. ", got " .. type(value)) end
                    end
                end
            end
            subscribe(group)
        end
        local listener = {callback=callback, valueType=valueType, enabled=true}
        group.listeners[#group.listeners + 1] = listener
        if state == "active" then group.activate() end
        return function()
            if not listener.enabled then return end
            listener.enabled = false
            for i, item in ipairs(group.listeners) do if item == listener then table.remove(group.listeners, i); break end end
            if #group.listeners == 0 then safe(group.deactivate) end
        end
    end
    -- Start/Enable share one transition; repeat calls cannot register twice.
    function scope.activate()
        if state == "active" or state == "destroyed" then return end
        state = "active"
        visitSubscriptions("activate")
        syncUpdate()
    end
    -- Disable pauses subscriptions and timers; activation resumes their remaining delay.
    function scope.deactivate()
        if state == "inactive" or state == "destroyed" then return end
        state = "inactive"
        visitSubscriptions("deactivate")
        syncUpdate()
    end
    -- Destruction is terminal and drops every resource owned by this mount.
    function scope.dispose()
        if state == "destroyed" then return end
        state = "destroyed"
        visitSubscriptions("dispose")
        subscriptions, groups, variables = {}, {}, {}
        syncUpdate()
    end
    return scope
end
return M
