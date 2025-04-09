import jsdom from "jsdom";

export async function GET() {
  try {
    let html = await fetch("https://en.uesp.net/maps/mwmap/mwmap.html").then(
      (res) => res.text()
    );

    html = html.replaceAll("../", "https://en.uesp.net/maps/");

    html = html.replace(
      "mwmap2.js?",
      "https://en.uesp.net/maps/mwmap/mwmap2.js?"
    );

    const dom = new jsdom.JSDOM(html);

    let styles = `
      #umMenuBar {display: none !IMPORTANT;}
      #umMapContainer {top: 0 !IMPORTANT;}

    `;

    if (process.env.HIDE_SEARCH)
      styles += `#umSearchContainer {display: none !IMPORTANT;}`;

    console.log(styles)
    const styleNode = dom.window.document.createElement("style");
    styleNode.textContent = styles;
    dom.window.document.head.appendChild(styleNode);

    return new Response(dom.serialize(), {
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
