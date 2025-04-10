import { Player } from "@/types";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

const players: Player[] = [];

export async function POST(request: NextRequest) {
  try {
    const json: Player = await request.json();
    const playerIndex = players.findIndex((p) => p.name === json.name);

    const withLastSeen = { ...json, lastSeen: dayjs() };

    if (playerIndex >= 0) {
      players[playerIndex] = withLastSeen;
    } else {
      players.push(withLastSeen);
    }

    return new Response("OK", {
      status: 200,
    });
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    return Response.json(players);
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
