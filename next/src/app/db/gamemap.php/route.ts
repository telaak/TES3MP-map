import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;

    const action = query.get("action") as string;

    switch (action) {
      case "get_perm":
      case "get_worlds":
        const json = await fetch(
          `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
        ).then((res) => res.json());
        return Response.json(json);

      case "get_locs":
        if (process.env.HIDE_LOCATIONS) {
          return Response.json({
            action: "get_locs",
            locations: [],
            locationCount: 0,
          });
        } else {
          const json = await fetch(
            `https://gamemap.uesp.net/mw/db/gamemap.php?${query}`
          ).then((res) => res.json());
          return Response.json(json);
        }
    }

    return Response.json([]);
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
