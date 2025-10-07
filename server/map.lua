--[[
        Module: map.lua
    Purpose: Periodically collect online player state from the TES3MP server and
             POST it as a single batched JSON payload to an external map API endpoint
             defined by the MAP_API environment variable (one HTTP request per interval).
             When the player list becomes empty, an empty array is POSTed once; further
             empty intervals are suppressed until at least one player reconnects.

    Data Sent Per Player (inside top-level 'players' array):
            * Identity: name, race, gender (isMale), head, hair
            * Stats: base & current health, magicka, fatigue, level
            * Location: current cell & region plus current and previous cell XYZ positions

        Scheduling:
            * A repeating tes3mp timer invokes Timer() every API_INTERVAL ms (env var)
            * Timer restarts itself at the end to ensure continuous updates

        Dependencies:
            * LuaSocket (socket.http, ltn12) for HTTP POST
            * dkjson for JSON encoding
            * Global tables/functions provided by TES3MP scripting environment:
                    - Players, tableHelper, tes3mp
        * Environment:
            - MAP_API (target endpoint)
            - MAP_SHARED_SECRET (shared password; sent as X-Map-Auth header)
--]]

http = require("socket.http") -- retained for potential future fallback but not used for blocking calls now
local urlParser = require("socket.url")
local tcp = require("socket").tcp
json = require("dkjson")
map = {}
-- Tracks whether the last successful POST had zero players. Used to avoid
-- repeatedly sending empty payloads every interval; we only send an empty
-- array once when transitioning from non-empty -> empty.
local wasEmptyLastTick = false

-- Fire-and-forget POST using raw TCP; sends request then immediately closes without reading the response.
-- Limitations:
--   * Only supports plain http:// (no TLS). If MAP_API uses https, call is skipped silently.
--   * No retry, no status visibility, failures after connect are ignored.
-- Appropriate for best-effort telemetry where latency and non-blocking behavior trump reliability metrics.
local function fireAndForgetPost(rawUrl, body)
    if not rawUrl or rawUrl == '' then return end
    local parsed = urlParser.parse(rawUrl)
    if not parsed or not parsed.host then return end
    if parsed.scheme and parsed.scheme ~= 'http' then return end
    local host = parsed.host
    local port = tonumber(parsed.port) or 80
    local path = parsed.path or '/'
    local secret = os.getenv("MAP_SHARED_SECRET") or ""
    local requestLines = {
        string.format("POST %s HTTP/1.1", path),
        "Host: " .. host,
        "Content-Type: application/json",
        "Content-Length: " .. tostring(#body),
        "Connection: close",
        "X-Map-Auth: " .. secret,
        "",
        body
    }
    local payload = table.concat(requestLines, "\r\n")
    local sock = tcp()
    if not sock then return end
    sock:settimeout(0.3)
    if not sock:connect(host, port) then
        sock:close(); return
    end
    sock:send(payload)
    sock:close()
end
do
    function Timer()
        local playerCount = tableHelper.getCount(Players)
        -- Proceed only if at least one player is connected (playerCount > 0)
        if playerCount > 0 then
            local playersPayload = {} -- accumulate all active player objects
            -- Iterate over all possible player slots
            for i = 0, tes3mp.GetMaxPlayers() - 1 do
                -- Validate active, logged-in player entry
                if (Players[i] ~= nil and Players[i].loggedIn) then
                    table.insert(playersPayload, {
                        name = Players[i].data.login.name,
                        head = tes3mp.GetHead(i),
                        hair = tes3mp.GetHair(i),
                        race = tes3mp.GetRace(i),
                        isMale = tes3mp.GetIsMale(i),
                        stats = {
                            baseHealth = tes3mp.GetHealthBase(i),
                            currentHealth = tes3mp.GetHealthCurrent(i),
                            baseMagicka = tes3mp.GetMagickaBase(i),
                            currentMagicka = tes3mp.GetMagickaCurrent(i),
                            baseFatigue = tes3mp.GetFatigueBase(i),
                            currentFatigue = tes3mp.GetFatigueCurrent(i),
                            level = tes3mp.GetLevel(i)
                        },
                        location = {
                            cell = tes3mp.GetCell(i),
                            regionName = Players[i].data.location.regionName,
                            posX = tes3mp.GetPosX(i),
                            posY = tes3mp.GetPosY(i),
                            posZ = tes3mp.GetPosZ(i),
                            previousX = tes3mp.GetPreviousCellPosX(i),
                            previousY = tes3mp.GetPreviousCellPosY(i),
                            previousZ = tes3mp.GetPreviousCellPosZ(i)
                        }
                    })
                end
            end

            -- Only send request if there were any active players collected
            if #playersPayload > 0 then
                local request_body = json.encode({ players = playersPayload }, { indent = true })
                fireAndForgetPost(os.getenv("MAP_API"), request_body)
                wasEmptyLastTick = false -- we sent non-empty payload
            end
        else
            -- No players currently online. If we haven't yet notified the API of emptiness, do so once.
            if wasEmptyLastTick == false then
                local request_body = json.encode({ players = {} }, { indent = true })
                fireAndForgetPost(os.getenv("MAP_API"), request_body)
                wasEmptyLastTick = true -- prevent repeated empty sends
            end
        end
        -- Reschedule timer using the current interval from environment
        tes3mp.RestartTimer(timerId, tonumber(os.getenv("API_INTERVAL")))
    end
end

-- Create repeating timer and start it
timerId = tes3mp.CreateTimer("Timer", tonumber(os.getenv("API_INTERVAL")))
tes3mp.StartTimer(timerId)

return map
