import { useQuery } from "@tanstack/react-query";
import { NextRequest } from "next/server";
import { MorrowindLocation, Player } from "./types";
import { locations } from "./app/constants";
import { getLeafletFrame } from "./app/(leaflet)/iframe";
import { LatLng, Marker } from "leaflet";

/**
 * React Query hook that polls the local /players endpoint for the latest player snapshot.
 *
 * Poll interval: 250ms (smooth position updates).
 *
 * @remarks Returned data array contains zero or more Player objects; hook never throws but
 * may temporarily return stale data per React Query semantics.
 *
 * @returns Query result object (see @tanstack/react-query useQuery return type) whose `data` is `Player[] | undefined`.
 */
export const usePlayerQuery = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const players: Player[] = await fetch("/players").then((res) =>
        res.json()
      );
      return players;
    },
    refetchInterval: 250,
  });

/**
 * Loads static world location metadata (towns, dungeons, etc.) from the upstream gamemap service.
 *
 * @returns Query result whose `data` is an array of MorrowindLocation, or undefined while loading.
 */
export const useLocationQuery = () =>
  useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const locationResponse: {
        action: "get_locs";
        locationCount: number;
        locations: MorrowindLocation[];
      } = await fetch(
        "https://gamemap.uesp.net/mw/db/gamemap.php?action=get_locs&world=1&db=mw"
      ).then((res) => res.json());
      return locationResponse.locations;
    },
  });

/**
 * Handle proxying permitted gamemap API actions while optionally hiding location data.
 *
 * Supported actions:
 *  - get_perm
 *  - get_worlds
 *  - get_locs (subject to HIDE_LOCATIONS env var suppression)
 *
 * @param request Incoming Next.js request (query string parsed from `nextUrl`).
 * @returns Raw JSON from upstream or a redacted empty payload (for get_locs when hidden).
 */
export async function handleGamemapRequest(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const action = query.get("action") as string;

  switch (action) {
    case "get_perm":
    case "get_worlds":
      return await fetch(
        `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
      ).then((res) => res.json());

    case "get_locs":
      if (process.env.HIDE_LOCATIONS) {
        return {
          action: "get_locs",
          locations: [],
          locationCount: 0,
        };
      } else {
        return await fetch(
          `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
        ).then((res) => res.json());
      }
  }
}

/**
 * Attempt to resolve an interior cell name to a known exterior map coordinate.
 *
 * Strategy (first match wins):
 *  1. Full cell string substring match in location.description
 *  2. If cell contains ':', try substring before ':' against description
 *  3. Exact name match (location.name === first comma-delimited token)
 *  4. Substring match of first comma-delimited token in description
 *
 * @param cell Raw cell string (may include commas / colon variants)
 * @returns Matching location or undefined if no heuristic matched.
 */
function resolveInteriorCell(cell: string): MorrowindLocation | undefined {
  // 1. Direct description match
  const direct = locations.find((loc) => loc.description.includes(cell));
  if (direct) return direct;

  // Prepare tokens
  const firstCommaToken = cell.split(",")[0];

  // 2. Colon variant (e.g., "Balmora: Guild of Mages") → take prefix
  if (cell.includes(":")) {
    const colonPrefix = cell.split(":")[0];
    const colonMatch = locations.find((loc) =>
      loc.description.includes(colonPrefix)
    );
    if (colonMatch) return colonMatch;
  }

  // 3. Exact name match
  const exactName = locations.find((loc) => loc.name === firstCommaToken);
  if (exactName) return exactName;

  // 4. Fallback description substring match using first comma token
  const fallbackDesc = locations.find((loc) =>
    loc.description.includes(firstCommaToken)
  );
  if (fallbackDesc) return fallbackDesc;

  return undefined;
}

export function getCoords(player: Player): LatLng {
  const playerCoords = getLatLngs([player.location.posX, player.location.posY]);

  // Only attempt interior resolution when regionName empty (interior cell heuristic)
  if (player.location.regionName.length === 0) {
    const match = resolveInteriorCell(player.location.cell);
    if (match) {
      return getLatLngs([match.x, match.y]);
    }
  }

  return playerCoords;
}

/**
 * Thin wrapper acquiring the iframe's gamemap instance to translate raw coordinate array
 * into a Leaflet LatLng using upstream projection logic.
 *
 * @param coordArray Tuple of [x, y] world coordinates.
 */
export function getLatLngs(coordArray: [x: number, y: number]): LatLng {
  const leafletFrame = getLeafletFrame();
  const gamemap = leafletFrame.contentWindow.gamemap;
  return gamemap.getLatLngs(coordArray);
}

/**
 * Imperatively set the map viewport to a coordinate and zoom level.
 *
 * @param coords Target map coordinate.
 * @param zoomLevel Desired zoom level.
 */
export function setView(coords: LatLng, zoomLevel: number) {
  const leafletFrame = getLeafletFrame();
  const gamemap = leafletFrame.contentWindow.gamemap;
  gamemap.getMap().setView(coords, zoomLevel);
}

/**
 * Remove stale Leaflet markers whose player no longer exists in the latest snapshot.
 *
 * @param markers Mutable array of current Leaflet markers (modified in-place).
 * @param players Fresh player list to reconcile against.
 */
export function spliceMarkers(markers: Marker[], players: Player[]) {
  for (let index = markers.length - 1; index >= 0; index--) {
    const marker = markers[index];

    const foundPlayer = players.find((p) =>
      marker.options.title?.startsWith(p.name)
    );

    if (!foundPlayer) {
      markers.splice(index, 1);
      marker.remove();
    }
  }
}

/**
 * Create and register a new Leaflet marker for a player, pushing it into the supplied markers array.
 *
 * @param player Player to visualize.
 * @param markers Mutable collection storing active markers.
 */
export function addMarker(player: Player, markers: Marker[]) {
  const leafletFrame = getLeafletFrame();
  const gamemap = leafletFrame.contentWindow.gamemap;
  const L = leafletFrame.contentWindow.L;

  const playerCoords = getCoords(player);

  const headIcon = L.icon({
    iconUrl: `/head/${player.head}-${player.hair}.png`,
    iconSize: [50, 50],
  });

  const marker = L.marker(playerCoords, {
    icon: headIcon,
    title: `${player.name}`,
  });
  marker.addTo(gamemap.getMap());
  markers.push(marker);
}
