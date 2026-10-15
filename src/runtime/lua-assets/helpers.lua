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
function M.multi(...) return ... end
function M.scriptHandle(script) return script end
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
function M.listenKey(control, event, callback)
    control:AddKeyEventListener(event, callback)
    local listening = true
    return function()
        if not listening then return end
        listening = false
        if control.alive then control:RemoveKeyEventListener(event, callback) end
    end
end
function M.defineSignal(name, params) return {__gstsSignal = true, name = name, params = params} end
-- @gsts:signal-writers
function M.send(signal, ...)
    local instance = game.ServerSignal(signal.name)
    for i, param in ipairs(signal.params) do
        local method = writers[param[2]]
        if not method then error("Unsupported signal parameter type: " .. tostring(param[2])) end
        local value = select(i, ...)
        instance[method](instance, value)
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
        if spec.type == "control" then
            if not M.isControl(value, spec.kind) then error("Script parameter " .. name .. " must be " .. spec.kind) end
        elseif type(value) ~= spec.type then
            error("Script parameter " .. name .. " must be " .. spec.type .. ", got " .. type(value))
        end
        values[name] = value
    end
    return values
end
local function validSignalValue(kind, value)
    if kind:sub(-5) == "_list" then
        if type(value) ~= "table" then return false end
        local count = 0
        for key, item in pairs(value) do
            if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #value then return false end
            if not validSignalValue(kind:sub(1, -6), item) then return false end
            count = count + 1
        end
        return count == #value
    end
    if kind == "str" then return type(value) == "string" end
    if kind == "bool" then return type(value) == "boolean" end
    if kind == "vec3" then
        return type(value) == "table" and validSignalValue("float", value.x)
            and validSignalValue("float", value.y) and validSignalValue("float", value.z)
    end
    if not writers[kind] or type(value) ~= "number" or value ~= value or math.abs(value) == math.huge then return false end
    return kind == "float" or (value % 1 == 0 and math.abs(value) <= 9007199254740991)
end

-- Pending in-game confirmation: assume EnableUpdate also gates OnLevelUpdate.
-- Keeping it enabled for level timers is correct under either known host interpretation.
local LEVEL_CLOCK_NEEDS_UPDATE = true

-- One scope belongs to one mount. The ordered list owns every external subscription.
function M.createScope(env, clock)
    local scope, groups, subscriptions = {}, {}, {}
    -- Legal: idle -> active/inactive/destroyed; active <-> inactive; either -> destroyed.
    -- Repeating a state change and activating a destroyed scope are ignored.
    local state = "idle"
    local now, tasks, order, ticking = 0, {}, {}, false
    local userWantsUpdate, actualUpdate = false, false
    -- The host switch belongs to the scope; timer demand never changes user intent.
    local function syncUpdate()
        local timerNeedsUpdate = clock == "real" or (clock == "level" and LEVEL_CLOCK_NEEDS_UPDATE)
        local enabled = state == "active" and (userWantsUpdate or (timerNeedsUpdate and next(tasks) ~= nil))
        if enabled ~= actualUpdate then
            actualUpdate = enabled
            env.script:EnableUpdate(enabled)
        end
    end
    -- Generated user OnUpdate code reads only this intent, never the physical host switch.
    function scope.wantsUpdate() return state == "active" and userWantsUpdate end
    -- Only calls targeting the current script are redirected here by the compiler.
    function scope.enableUpdate(enabled)
        userWantsUpdate = enabled
        syncUpdate()
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

    -- The timer queue is one subscription; disabling it drops every pending task.
    local timers = {}
    function timers.activate()
        syncUpdate()
    end
    -- Clock position survives a disable; pending callbacks do not.
    function timers.deactivate() tasks, order = {}, {}; syncUpdate() end
    timers.dispose = timers.deactivate
    if clock then subscribe(timers) end

    -- Setup may schedule before activation; inactive/destroyed instances cannot add timers.
    local function schedule(callback, delay, repeated, ...)
        if state == "inactive" or state == "destroyed" then error("Cannot schedule a timer on a disabled or destroyed script") end
        delay = delay or 0
        if type(callback) ~= "function" or type(delay) ~= "number" or delay ~= delay or math.abs(delay) == math.huge then error("Invalid timer callback or delay") end
        delay = math.max(0, delay)
        local handle = {}
        tasks[handle] = {callback=callback, delay=delay, due=now+delay, repeated=repeated, args={n=select('#',...),...}}
        order[#order+1] = handle
        syncUpdate()
        return handle
    end
    -- Timer handles are opaque identities and belong only to this mount.
    function scope.setTimeout(callback, delay, ...) return schedule(callback, delay, false, ...) end
    -- Missed intervals run once per tick, rather than replaying an unbounded backlog.
    function scope.setInterval(callback, delay, ...) return schedule(callback, delay, true, ...) end
    -- Cancelling an unknown or already cancelled handle is harmless.
    function scope.clearTimeout(handle)
        if handle ~= nil then tasks[handle] = nil; syncUpdate() end
    end
    scope.clearInterval = scope.clearTimeout
    -- A tick cannot re-enter itself; tasks created during it run on a later tick.
    function scope.tick(dt)
        if state ~= "active" or ticking then return end
        if type(dt) ~= "number" or dt < 0 or dt ~= dt or dt == math.huge then report("Invalid timer delta"); return end
        ticking = true
        now = now + dt * 1000
        local snapshot = {}
        for i, handle in ipairs(order) do snapshot[i] = handle end
        for _, handle in ipairs(snapshot) do
            if state ~= "active" then break end
            local task = tasks[handle]
            if task and task.due <= now then
                if task.repeated then
                    task.due = task.delay > 0 and (now + task.delay - (now - task.due) % task.delay) or now
                else tasks[handle] = nil end
                local ok, message = pcall(task.callback, table.unpack(task.args, 1, task.args.n))
                if not ok then tasks[handle] = nil; report(message) end
            end
        end
        local remaining = {}
        for _, handle in ipairs(order) do if tasks[handle] then remaining[#remaining+1] = handle end end
        order = remaining
        ticking = false
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
                if name ~= signal.name or type(values) ~= "table" or #values ~= #signal.params then
                    report("Invalid signal payload: " .. signal.name .. " (parameter count)"); return
                end
                local count = 0
                for key in pairs(values) do
                    if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #signal.params then
                        report("Invalid signal payload: " .. signal.name .. " (parameter index)"); return
                    end
                    count = count + 1
                end
                if count ~= #signal.params then report("Invalid signal payload: " .. signal.name); return end
                local params = {}
                for i, param in ipairs(signal.params) do
                    if not validSignalValue(param[2], values[i]) then
                        report("Invalid signal payload: " .. signal.name .. "." .. param[1]); return
                    end
                    params[param[1]] = values[i]
                end
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
    -- Key listeners use the same activation and disposal list as signals and the timer queue.
    function scope.listenKey(control, event, callback)
        if state == "destroyed" then error("Cannot listen after script destruction") end
        local key = {}
        -- There is never more than one host callback for this subscription.
        function key.activate() if not key.off then key.off = M.listenKey(control, event, callback) end end
        -- Removal uses the original callback identity, then clears the active handle.
        function key.deactivate()
            local off = key.off
            key.off = nil
            if off then off() end
        end
        key.dispose = key.deactivate
        return subscribe(key)
    end
    -- Start/Enable share one transition; repeat calls cannot register twice.
    function scope.activate()
        if state == "active" or state == "destroyed" then return end
        state = "active"
        visitSubscriptions("activate")
        syncUpdate()
    end
    -- Disable retains subscriptions for reactivation but always clears pending timers.
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
        subscriptions, groups = {}, {}
        syncUpdate()
    end
    return scope
end
return M
