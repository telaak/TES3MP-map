import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let xml = `<locations><rowcount totalrows="0" rowcount="0" startrow="0"/></locations>`;

    if (!process.env.HIDE_LOCATIONS) {
      const query = request.nextUrl.searchParams;
      xml = await fetch(
        `https://en.uesp.net/maps/getmaplocs.php?${query}`
      ).then((res) => res.text());
    }

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
