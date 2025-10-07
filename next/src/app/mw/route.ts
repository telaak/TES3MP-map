/**
 * /mw route handler
 *
 * Purpose:
 *  Acts as an iframe-compatible proxy wrapper around the external Morrowind
 *  gamemap hosted at https://gamemap.uesp.net/mw/.
 *
 * Transformations performed:
 *  1. Fetches the remote HTML and selectively rewrites relative asset paths (attributes starting with './')
 *     to absolute 'https://gamemap.uesp.net/mw/' equivalents for iframe embedding.
 *  2. Injects custom inline CSS to hide the remote watermark and remove Leaflet icon
 *     background + box-shadow for cleaner integration with our own markers.
 *  3. Injects a small script that overrides/defines gamemap.isEmbedded() to always
 *     return true, signaling to the embedded map that it's running in an iframe
 *     context.
 *
 * Implementation notes:
 *  - Uses JSDOM server-side to parse and mutate the fetched HTML prior to sending.
 *  - We return full HTML with Content-Type text/html so the browser renders it as a page.
 *  - Relative path rewriting is now attribute-based to avoid accidental text replacements in inline scripts.
 */
import jsdom from "jsdom";

/** Base origin for upstream Morrowind map */
const UPSTREAM_BASE = "https://gamemap.uesp.net/mw/";

/** Attributes that may legitimately contain relative asset paths we want to absolutize. */
const REWRITABLE_ATTRS = ["src", "href", "data-src", "poster"] as const;

/**
 * Rewrite a single attribute value if it starts with './'
 */
function absolutize(attrValue: string): string {
  if (attrValue.startsWith("./")) {
    return UPSTREAM_BASE + attrValue.slice(2);
  }
  if (attrValue === "./") {
    return UPSTREAM_BASE;
  }
  return attrValue;
}

/**
 * GET /mw
 * Fetch and transform upstream Morrowind map HTML for iframe embedding.
 *
 * @returns Full HTML response with injected styles and script.
 */
export async function GET() {
  try {
    // 1. Retrieve upstream HTML.
    const upstreamHtml = await fetch(UPSTREAM_BASE).then((res) => res.text());

    // 2. Parse HTML with JSDOM for DOM-level mutations.
    const dom = new jsdom.JSDOM(upstreamHtml);
    const { document } = dom.window;

    // 3. Selectively rewrite relative asset references in a controlled manner.
    const treeWalker = document.createTreeWalker(
      document,
      dom.window.NodeFilter.SHOW_ELEMENT
    );
    while (treeWalker.nextNode()) {
      const el = treeWalker.currentNode as HTMLElement;
      for (const attr of REWRITABLE_ATTRS) {
        if (el.hasAttribute(attr)) {
          const original = el.getAttribute(attr) || "";
          const rewritten = absolutize(original.trim());
          if (rewritten !== original) {
            el.setAttribute(attr, rewritten);
          }
        }
      }
    }

    // 4. Build custom stylesheet overrides.
    const styles = `
      #watermark {display: none !IMPORTANT;}
      .leaflet-marker-icon {background-color: unset !IMPORTANT; box-shadow: unset !IMPORTANT;}
    `;

    const styleNode = document.createElement("style");
    styleNode.textContent = styles;
    document.head.appendChild(styleNode);

    // 5. Inject embedding flag script. We set isEmbedded to return true once document 'load' fires.
    const scriptNode = document.createElement("script");
    scriptNode.textContent = `document.addEventListener('load', () => gamemap.isEmbedded = () => true)`;
    document.head.appendChild(scriptNode);

    // 6. Serialize modified DOM back to string and respond.
    return new Response(dom.serialize(), {
      headers: {
        "Content-Type": "text/html",
        // Optional: Could add a CSP header if further locking down is desired.
      },
    });
  } catch (error) {
    return new Response((error as Error).message || "Upstream proxy failure", {
      status: 500,
    });
  }
}
