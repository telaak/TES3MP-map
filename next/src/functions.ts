import { useQuery } from "@tanstack/react-query";
import { NextRequest } from "next/server";
import dayjs from "dayjs";
import { MorrowindLocation, Player } from "./types";
import { locations } from "./app/constants";
import { getLeafletFrame } from "./app/(leaflet)/iframe";
import { LatLng, Marker } from "leaflet";

export const usePlayerQuery = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const players: Player[] = await fetch("/players").then((res) =>
        res.json()
      );
      return players
    },
    refetchInterval: 250,
  });

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

export async function handleGamemapRequest(request: NextRequest) {
  const query = request.nextUrl.searchParams;

  const action = query.get("action") as string;

  switch (action) {
    case "get_perm":
    case "get_worlds":
      const json = await fetch(
        `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
      ).then((res) => res.json());
      return json;

    case "get_locs":
      if (process.env.HIDE_LOCATIONS) {
        return {
          action: "get_locs",
          locations: [],
          locationCount: 0,
        };
      } else {
        const json = await fetch(
          `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
        ).then((res) => res.json());
        return json;
      }
  }
}

export function getCoords(player: Player): LatLng {
  const playerCoords = getLatLngs([player.location.posX, player.location.posY]);

  // not exterior cell
  if (player.location.regionName.length === 0) {
    const foundLocation = locations.find((location) =>
      location.description.includes(player.location.cell)
    );

    if (foundLocation) {
      return getLatLngs([foundLocation.x, foundLocation.y]);
    } else {
      const splitLocation = player.location.cell.split(",");
      const searchString = splitLocation[0];

      if (player.location.cell.includes(":")) {
        const twoSplit = player.location.cell.split(":");
        const twoSearchString = twoSplit[0];
        const twoLocation = locations.find((location) =>
          location.description.includes(twoSearchString)
        );
        if (twoLocation) {
          return getLatLngs([twoLocation.x, twoLocation.y]);
        }
      }

      const genericLocation =
        locations.find((location) => location.name === searchString) ||
        locations.find((location) =>
          location.description.includes(searchString)
        );

      if (genericLocation) {
        return getLatLngs([genericLocation.x, genericLocation.y]);
      }
    }
  }

  return playerCoords;
}

export function getLatLngs(coordArray: [x: number, y: number]): LatLng {
  const leafletFrame = getLeafletFrame();
  const gamemap = leafletFrame.contentWindow.gamemap;
  return gamemap.getLatLngs(coordArray);
}

export function setView(coords: LatLng, zoomLevel: number) {
  const leafletFrame = getLeafletFrame();
  const gamemap = leafletFrame.contentWindow.gamemap;
  gamemap.getMap().setView(coords, zoomLevel);
}

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
