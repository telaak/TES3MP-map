import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const xml = await fetch(
      `https://en.uesp.net/maps/getmaplocs.php?${query}`
    ).then((res) => res.text());
    return new Response(xml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
