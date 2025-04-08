export async function GET() {
  try {
    const xml = `<locations><rowcount totalrows="0" rowcount="0" startrow="0"/></locations>`;
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
