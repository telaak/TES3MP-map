import { useQuery } from "@tanstack/react-query";
import { Player } from "./app/players/route";

export const playerQuery = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: () =>
      fetch("/players").then((res) => res.json()) as Promise<Player[]>,
    refetchInterval: 250,
  });
