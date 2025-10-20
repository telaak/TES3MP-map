# TES3MP Map & Player Tracker

Dynamic real‑time player map for TES3MP using UESP's Morrowind world map tiles. Provides:

* Player overlay with stats (health / magicka / fatigue / level)
* Player heads with player names on the map
* Click the location to zoom onto a player

<img width="698" height="473" alt="Screenshot 2025-10-07 at 13 51 03" src="https://github.com/user-attachments/assets/5bf22e58-97ba-4907-9373-7bfe1b02a04a" />

---

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Environment Variables](#3-environment-variables)
4. [Running Locally](#4-running-locally)
5. [Server (Lua) Integration](#5-server-lua-integration)
6. [Head Generator Tooling](#6-head-generator-tooling)
7. [API Routes](#7-api-routes-current-branch)
8. [Security (Shared Secret)](#8-security-shared-secret)
9. [Troubleshooting](#9-troubleshooting)
10. [License](#10-license)

---

## 1. Overview
Lua code on the TES3MP server batches all online players (stats + location) into a single JSON snapshot and periodically POSTs it to the Next.js app. The app keeps only the latest snapshot in memory and exposes it at `/players`. Writes are protected by a shared secret (`X-Map-Auth`).

## 2. Architecture
```
TES3MP Server
	└─ map.lua (timer)
			 ├─ Collect player data
			 ├─ POST { players: [...] } to MAP_API (with X-Map-Auth)
			 └─ Sends empty array ONCE when last player disconnects

Next.js App (./next)
	├─ /players (POST) – snapshot ingestion (auth required)
	├─ /players (GET)  – current snapshot (array of players)
	└─ Renders map + overlays

Head Generator (./head-generator)
	├─ parseImages.js – automates capture from in-browser scene
	└─ crop.js – chroma‑key remove (#00FF00) & autocrop icons
```

## 3. Environment Variables
Set these in both the TES3MP server environment and the Next.js deployment where applicable.

| Variable | Location | Purpose |
|----------|----------|---------|
| `MAP_API` | TES3MP server | Full URL to Next.js ingestion endpoint (e.g. `https://your-domain/players`) |
| `API_INTERVAL` | TES3MP server | Milliseconds between snapshot posts (timer restart interval) |
| `MAP_SHARED_SECRET` | TES3MP server & Next.js | Shared password used in `X-Map-Auth` header |

### Next.js Only (optional)
None currently required beyond `MAP_SHARED_SECRET`. Add future flags as needed (e.g. enable websockets, feature toggles).

### Example `.env.local` (Next.js)
```
MAP_SHARED_SECRET=superlongrandomsecret
```

### Example shell exports (TES3MP server)
```bash
export MAP_API="https://example.com/players"
export API_INTERVAL=5000
export MAP_SHARED_SECRET=superlongrandomsecret
```

## 4. Running Locally

### A. Plain Node (development)
```bash
cd next
npm install
npm run dev
# App at http://localhost:3000
```

### B. Docker Build (Next.js standalone)
The `next/Dockerfile` builds a production image (`next build` + standalone output). Example:
```bash
docker build -t tes3mp-map:dev ./next
docker run -p 3000:3000 -e MAP_SHARED_SECRET=devsecret tes3mp-map:dev
```

### C. docker-compose
Below is a sample `docker-compose.yml` you can adapt:
```yaml
services:
    tes3mp:
        container_name: tes3mp
        image: ghcr.io/telaak/tes3mp-map-server:1.0.1
        restart: unless-stopped
        ports:
            - 25565:25565/tcp
            - 25565:25565/udp
        environment:
            # https://github.com/ich777/docker-openmw-tes3mp
            - GAME_V=latest
            - UID=99
            - GID=100
            - UMASK=0000
            - DATA_PERM=770
            - MAP_API=http://next:3000/players
            - MAP_SHARED_SECRET=i-like-cats
            - API_INTERVAL=500
        volumes:
            - /data/openmw-tes3mp:/openmw


    next:
      container_name: next
      image: ghcr.io/telaak/tes3mp-map-next:1.0.1
      restart: unless-stopped
      ports:
        - 3000:3000
      environment:
        - HIDE_SEARCH=true
        - HIDE_LOCATIONS=true
        - MAP_SHARED_SECRET=i-like-cats

```

Launch with:
export MAP_SHARED_SECRET=superlongrandomsecret
docker compose up --build
```

### Server Docker Image

The TES3MP server container is built from the base image project [ich777/docker-openmw-tes3mp](https://github.com/ich777/docker-openmw-tes3mp).

Build your own extended image (adds `lua-socket`, custom scripts, and the map module) using the provided `server/Dockerfile`:
```bash
docker build -t tes3mp-map-server ./server
docker run -d \
    --name tes3mp-server \
    -p 25565:25565/tcp -p 25565:25565/udp \
    -e MAP_API=http://host.docker.internal:3000/players \
    -e MAP_SHARED_SECRET=superlongrandomsecret \
    -e API_INTERVAL=5000 \
    tes3mp-map-server
```

Notes:
* Adjust `MAP_API` to point at your reachable Next.js endpoint (inside docker compose you can use `http://next:3000/players`).
* Volume mounting (e.g. `/data/openmw-tes3mp:/openmw`) is handled in the compose example; add `-v` flags if running directly.
* The Dockerfile installs `lua-socket` and copies `map.lua` & `customScripts.lua` into the container.

#### Rebuilding after changes
If you modify `server/map.lua` run:
```bash
docker build -t tes3mp-map-server ./server --no-cache
```

---

## 5. Server (Lua) Integration

Place `server/map.lua` into your TES3MP scripts directory (e.g. `mp-stuff/scripts/custom/`). In `serverCore.lua`:
```lua
map = require("custom/map")
```
Ensure environment variables are exported before starting the TES3MP server process.

### Prerequisites
The Lua script depends on:
* **lua-socket** (provides `socket.http` & `ltn12`) – installed in the provided server Docker image (`apt install lua-socket`). If running natively, install it via your distribution's package manager (e.g. `apt install lua-socket`) or LuaRocks (`luarocks install luasocket`).
* **dkjson** – usually bundled with TES3MP. If missing, install or place `dkjson.lua` in your Lua module path.

If either module is unavailable, the script will error on `require`. Verify by launching a Lua REPL inside the container and running: `require('socket.http')` and `require('dkjson')`.

## 6. Head Generator Tooling
Located in `head-generator/`:
|--------|---------|
| `parseImages.js` | Automates cycling through head/hair combos in a browser scene capturing PNGs with a green background. |
| `crop.js` | Removes chroma green (#00FF00) & autocrops to content using `replace-color` + Jimp. |

Pre-generated  head icon assets can be found at `next/public/heads/`. There should be no need to re-generate these (also the original site is down)

Basic usage:
```bash
cd head-generator
npm install
node crop.js
```
Ensure source images are in `head-generator/heads/` and the output dir `cropped/` exists.

## 7. API Routes (Current Branch)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/players` | Replace current snapshot. Body: `{ players: Player[] }` | `X-Map-Auth` required |
| GET  | `/players` | Retrieve snapshot (array) | None |

`Player` shape (simplified):
```ts
type Player = {
	name: string;
	head: string;
	hair: string;
	race: string;
	isMale: number; // 0/1 from TES3MP
	stats: { baseHealth: number; currentHealth: number; baseMagicka: number; currentMagicka: number; baseFatigue: number; currentFatigue: number; level: number; };
	location: { cell: string; regionName: string; posX: number; posY: number; posZ: number; previousX: number; previousY: number; previousZ: number; };
};
```

## 8. Security (Shared Secret)
All requests must include:
```
X-Map-Auth: <MAP_SHARED_SECRET>
```

## 9. Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 401 on POST | Bad/missing secret | Verify `MAP_SHARED_SECRET` both sides |
| Always empty players array | Lua timer not firing or MAP_API wrong | Check server logs & env vars |
| Icons missing | Head generator not run | Run scripts & ensure path mapping |

---

## Quick Reference
POST ingest test:
```bash
curl -X POST "$MAP_API" \
	-H "Content-Type: application/json" \
	-H "X-Map-Auth: $MAP_SHARED_SECRET" \
	-d '{"players":[]}'
```

GET snapshot:
```bash
curl http://localhost:3000/players
```

## 10. License
Released under the MIT License. See the [LICENSE](./LICENSE) file for full text.
