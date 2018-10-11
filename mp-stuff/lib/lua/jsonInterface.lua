io2 = require("io2")
local json = require("dkjson")

local jsonInterface = {}

function jsonInterface.load(fileName)
    local home = os.getenv("MOD_DIR") .. "/"
    local file = assert(io2.open(home .. fileName, "r"), "Error loading file: " .. fileName)
    local content = file:read("*a")
    file:close()
    return json.decode(content, 1, nil)
end

function jsonInterface.save(fileName, data, keyOrderArray)
    local home = os.getenv("MOD_DIR") .. "/"
    local content = json.encode(data, {indent = true, keyorder = keyOrderArray})
    local file = io2.open(home .. fileName, "w+b")
    local http = require("socket.http")

    if file ~= nil then
        file:write(content)
        file:close()
        local request_body = content
        local response_body = {}

        local res, code, response_headers =
            http.request {
            url = "http://localhost:5000/players/",
            method = "POST",
            headers = {
                ["Content-Type"] = "application/json",
                ["Content-Length"] = #request_body
            },
            source = ltn12.source.string(request_body),
            sink = ltn12.sink.table(response_body)
        }
        return true
    else
        return false
    end
end

return jsonInterface
