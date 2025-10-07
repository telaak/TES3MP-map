/**
 * @route /players
 * @summary Player snapshot ingestion & retrieval endpoint.
 * @description Accepts batched player state snapshots from the TES3MP server (see `server/map.lua`) and
 * exposes the latest snapshot via `GET` for UI / polling clients.
 *
 * @remarks
 * The POST body always represents an authoritative full snapshot (not a diff). When no players are online
 * the server-side script sends `{ players: [] }` exactly once on transition to empty; this route then
 * persists the empty array until the next non-empty snapshot arrives.
 *
 * @example POST payload
 * ```json
 * {
 *   "players": [
 *     {
 *       "name": "Player1",
 *       "head": "argonian_f_head_01",
 *       "hair": "argonian_f_hair01",
 *       "race": "Argonian",
 *       "isMale": 1,
 *       "stats": {
 *         "baseHealth": 100,
 *         "currentHealth": 95,
 *         "baseMagicka": 50,
 *         "currentMagicka": 50,
 *         "baseFatigue": 200,
 *         "currentFatigue": 180,
 *         "level": 5
 *       },
 *       "location": {
 *         "cell": "Balmora",
 *         "regionName": "Ascadian Isles",
 *         "posX": 123.4,
 *         "posY": 567.8,
 *         "posZ": 90.1,
 *         "previousX": 120,
 *         "previousY": 560,
 *         "previousZ": 90
 *       }
 *     }
 *   ]
 * }
 * ```
 *
 * @returns For GET: `Player[]` — the latest in-memory snapshot (empty array if none).
 * @security Shared secret header. The POST request must include `X-Map-Auth: <MAP_SHARED_SECRET>`
 * configured in the server environment. Requests missing or with an incorrect secret are rejected
 * with HTTP 401.
 * @see server/map.lua for producer of snapshot payloads.
 */
import { Player } from "@/types";
import { NextRequest } from "next/server";

// In-memory authoritative snapshot of the last POSTed player list.
let players: Player[] = [];

/**
 * Handle snapshot ingestion.
 * @function POST /players
 * @param request The incoming Next.js request containing a JSON body with a `players` array.
 * @returns Plain text `OK` response on success; HTTP 500 with error message on failure.
 */
export async function POST(request: NextRequest) {
  try {
  const provided = request.headers.get("X-Map-Auth");
  const expected = process.env.MAP_SHARED_SECRET;
  if (!expected) {
    return new Response("Server misconfiguration: MAP_SHARED_SECRET not set", { status: 500 });
  }
  if (!provided || provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  const json = await request.json();
  // Trusting map.lua to provide validated structure; cast to Player[].
  const jsonPlayers = json.players as Player[];
  // Replace entire snapshot (not merging; this is an authoritative state push)
  players = jsonPlayers;

    return new Response("OK", {
      status: 200,
    });
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}

/**
 * Retrieve the latest snapshot of players.
 * @function GET /players
 * @returns JSON body of type `Player[]`. Returns `[]` if no snapshot has been posted yet or the last
 *          snapshot was empty.
 */
export async function GET() {
  try {
    return Response.json(players);
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
