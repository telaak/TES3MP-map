import { Player } from "@/types";
import { NextRequest } from "next/server";

let players: Player[] = [];

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const jsonPlayers =  json.players as Player[];
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

export async function GET() {
  try {
    return Response.json(players);
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
