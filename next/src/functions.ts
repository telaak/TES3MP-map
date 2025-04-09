import { useQuery } from "@tanstack/react-query";
import { Player } from "./app/players/route";
import { NextRequest } from "next/server";

export const usePlayerQuery = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: () =>
      fetch("/players").then((res) => res.json()) as Promise<Player[]>,
    refetchInterval: 250,
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
