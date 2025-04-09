export async function GET() {
  try {
    return Response.redirect(
      `https://gamemap.uesp.net/assets/maps/mw/config/mw-config.json`
    );
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
