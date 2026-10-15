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

-- One scope per mounted script, never per shared require module.
function M.createScope(env)
    local scope, groups, keys = {}, {}, {}
    local active, destroyed = false, false
    local function report(message) env.printerr("[GSTS] " .. tostring(message)) end
    local function safe(fn, ...)
        local ok, message = pcall(fn, ...)
        if not ok then report(message) end
    end
    local function register(group)
        if group.registered or #group.listeners == 0 then return end
        env.script:RegisterServerSignalHandler(group.signal.name, group.dispatch)
        group.registered = true
    end
    local function unregister(group)
        if not group.registered then return end
        group.registered = false
        safe(function() env.script:UnregisterServerSignalHandler(group.signal.name) end)
    end
    function scope.onSignal(signal, callback)
        if destroyed then error("Cannot subscribe after script destruction") end
        local group = groups[signal.name]
        if not group then
            group = {signal=signal, listeners={}, registered=false}
            groups[signal.name] = group
            function group.dispatch(name, values)
                if not active or destroyed then return end
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
                    if listener.enabled and active and not destroyed then safe(listener.callback, {name=name, params=params}) end
                end
            end
        else
            if #group.signal.params ~= #signal.params then error("Conflicting signal contract: " .. signal.name) end
            for i, param in ipairs(signal.params) do
                local previous = group.signal.params[i]
                if previous[1] ~= param[1] or previous[2] ~= param[2] then error("Conflicting signal contract: " .. signal.name) end
            end
        end
        local listener = {callback=callback, enabled=true}
        group.listeners[#group.listeners + 1] = listener
        if active then register(group) end
        return function()
            if not listener.enabled then return end
            listener.enabled = false
            for i, item in ipairs(group.listeners) do if item == listener then table.remove(group.listeners, i); break end end
            if #group.listeners == 0 then unregister(group) end
        end
    end
    function scope.listenKey(control, event, callback)
        if destroyed then error("Cannot listen after script destruction") end
        local key = {control=control, event=event, callback=callback, enabled=true}
        keys[#keys+1] = key
        if active then key.off = M.listenKey(control, event, callback) end
        return function()
            if not key.enabled then return end
            key.enabled = false
            if key.off then key.off(); key.off = nil end
            for i, item in ipairs(keys) do if item == key then table.remove(keys, i); break end end
        end
    end
    function scope.activate()
        if active or destroyed then return end
        active = true
        for _, group in pairs(groups) do register(group) end
        for _, key in ipairs(keys) do if key.enabled then key.off = M.listenKey(key.control, key.event, key.callback) end end
    end
    function scope.deactivate(destroy)
        active = false
        for _, group in pairs(groups) do unregister(group) end
        for _, key in ipairs(keys) do if key.off then safe(key.off); key.off = nil end end
        if destroy then destroyed = true; groups = {}; keys = {} end
    end
    function scope.install()
        for _, name in ipairs({"OnStart", "OnEnable"}) do
            local hook = env[name]
            env[name] = function(...) scope.activate(); if hook then return hook(...) end end
        end
        for _, name in ipairs({"OnDisable", "OnDestroy"}) do
            local hook = env[name]
            env[name] = function(...) scope.deactivate(name == "OnDestroy"); if hook then return hook(...) end end
        end
    end
    return scope
end
return M
