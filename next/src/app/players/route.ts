import { NextRequest } from "next/server";

export type Player = {
  name: string;
  head: string;
  hair: string;
  race: string;
  isMale: number;
  location: {
    cell: string;
    posX: number;
    posY: number;
    posZ: number;
    previousX: number;
    previousY: number;
    previousZ: number;
    regionName: string;
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
