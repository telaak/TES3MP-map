local http = require("socket.http")
local json = require("dkjson")
map = {}
do
  function Timer()
    if tableHelper.getCount(Players) > 0 then
      for i = 0, tableHelper.getCount(Players) - 1 do
        if (Players[i] ~= nil and Players[i].loggedIn) then
          local request_body = {
            name = Players[i].data.login.name,
            location = {
              cell = tes3mp.GetCell(i),
              regionName = Players[i].data.location.regionName,
              posX = tes3mp.GetPosX(i),
              posY = tes3mp.GetPosY(i),
              posZ = tes3mp.GetPosZ(i)
            }
          }

          local request_body = json.encode(request_body, {indent = true})

          local response_body = {}

          local res, code, response_headers =
            http.request {
            url = "http://localhost:5000/players/locations/",
            method = "POST",
            headers = {
              ["Content-Type"] = "application/json",
              ["Content-Length"] = #request_body
            },
            source = ltn12.source.string(request_body),
            sink = ltn12.sink.table(response_body)
          }
        end
      end
    end
    tes3mp.RestartTimer(timerId, time.seconds(1))
  end
end

timerId = tes3mp.CreateTimer("Timer", time.seconds(1))
tes3mp.StartTimer(timerId)

return map
