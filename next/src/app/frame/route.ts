export async function GET() {
  try {
    let html = await fetch("https://en.uesp.net/maps/mwmap/mwmap.html").then(
      (res) => res.text()
    );
    html = html.replace("../map2.css?", "https://en.uesp.net/maps/map2.css?");
    html = html.replace(
      "../map2mobile.css?",
      "https://en.uesp.net/maps/map2mobile.css?"
    );

    html = html.replaceAll("../images/", "https://en.uesp.net/maps/images/");

    html = html.replace(
      "../smallmaphelp.html",
      "https://en.uesp.net/maps/smallmaphelp.html"
    );

    html = html.replace(
      "mwmap2.js?",
      "https://en.uesp.net/maps/mwmap/mwmap2.js?"
    );
    html = html.replace(
      "../map_packed.js?",
      "https://en.uesp.net/maps/map_packed.js?"
    );
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new Response(error as string, {
      status: 500,
    });
  }
}
