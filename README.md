# TES3MP-map
Dynamic web map for players using UESP's Morrowind map

![Screenshot](https://laaksonen.eu/tes3mp.PNG)

## Installing

install the node.js package

```
$ npm install
```

add the map.lua file to mp-stuff/scripts, then add the following line to serverCore.lua

```
map = require("map")
```

Finally, load userscript.js using GreaseMonkey/TamperMonkey/etc.
