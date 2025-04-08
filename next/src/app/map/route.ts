import { NextRequest } from "next/server";

export type Player = {
  name: string;
  location: {
    cell: string;
    posX: number;
    regionName: string;
    posY: number;
    posZ: number;
  };
};

const players: Player[] = [];

export async function POST(request: NextRequest) {
  try {
    const json: Player = await request.json();
    const playerIndex = players.findIndex((p) => p.name === json.name);

    if (playerIndex >= 0) {
      players[playerIndex] = json;
    } else {
      players.push(json);
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
