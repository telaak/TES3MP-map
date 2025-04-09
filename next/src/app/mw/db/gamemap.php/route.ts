import { handleGamemapRequest } from "@/functions";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await handleGamemapRequest(request);

    return Response.json(response || []);
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
