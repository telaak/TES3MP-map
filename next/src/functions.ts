import { useQuery } from "@tanstack/react-query";
import { Player } from "./app/players/route";

export const usePlayerQuery = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: () =>
      fetch("/players").then((res) => res.json()) as Promise<Player[]>,
    refetchInterval: 250,
  });
