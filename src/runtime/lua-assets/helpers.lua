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
local writers = {int="AddInt", float="AddFloat", str="AddString", bool="AddBool", vec3="AddVector3", guid="AddGuid", entity="AddEntity", prefab_id="AddPrefabId", config_id="AddConfigId"}
for name, method in pairs({int="AddIntList", float="AddFloatList", str="AddStringList", bool="AddBoolList", vec3="AddVector3List", guid="AddGuidList", entity="AddEntityList", prefab_id="AddPrefabIdList", config_id="AddConfigIdList"}) do writers[name .. "_list"] = method end
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
return M
