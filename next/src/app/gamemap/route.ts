import { handleGamemapRequest } from "@/functions";
import { NextRequest } from "next/server";

/**
 * Unified gamemap endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const response = await handleGamemapRequest(request);
    return Response.json(response || []);
  } catch (error) {
    return new Response((error as Error).message || "Internal error", { status: 500 });
  }
}
