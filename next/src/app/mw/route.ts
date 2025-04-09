import jsdom from "jsdom";

export async function GET() {
  try {
    let html = await fetch("https://gamemap.uesp.net/mw/").then((res) =>
      res.text()
    );

    html = html.replaceAll("./", "https://gamemap.uesp.net/mw/");

    const dom = new jsdom.JSDOM(html);

    let styles = `
      #watermark {display: none !IMPORTANT;}
    `;

    const styleNode = dom.window.document.createElement("style");
    styleNode.textContent = styles;
    dom.window.document.head.appendChild(styleNode);

    // TODO

    const scriptNode = dom.window.document.createElement("script");
    scriptNode.textContent = `document.addEventListener('load', () => gamemap.isEmbedded = () => true)`;
    dom.window.document.head.appendChild(scriptNode);

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
