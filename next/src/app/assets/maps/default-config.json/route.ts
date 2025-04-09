export async function GET() {
  try {
    return Response.redirect(
      `https://gamemap.uesp.net/assets/maps/default-config.json`
    );
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
