import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;

    return Response.redirect(
      `https://gamemap.uesp.net/assets/maps/mw/css/mw-styles.css?${query}`
    );
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
