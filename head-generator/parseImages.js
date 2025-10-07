/**
 * @file parseImages.js
 * @description Browser-side helpers to iterate through Morrowind heads & hairs, render each
 * combination against a green background (for later chroma removal), and trigger PNG downloads.
 * The page is assumed to expose global THREE.js objects: `scene`, `camera`, `renderer`, and
 * to provide navigation buttons with ids `next_hair` and `next_head`, plus select elements
 * with ids `part_1` (hair) and `part_2` (head).
 *
 * Heads originally generated from:
 * https://github.com/teamnwah/morrowinds-heads
 */

scene.background = new THREE.Color(0x00ff00);

/**
 * Render the current head + hair configuration and download it as a PNG file.
 * The filename pattern is: <head>-<hair>.png derived from URL search params
 * where parameters `head` and `hair` are expected.
 * @returns {void}
 */
function renderImage() {
  const urlSearchParams = new URLSearchParams(
    window.location.href.slice(17).replace("#", "?")
  );
  renderer.setSize(1264 / 3, 947 / 3);
  renderer.render(scene, camera);
  const imgData = renderer.domElement.toDataURL();
  const link = document.createElement("a");
  link.setAttribute(
    "download",
    `${urlSearchParams.get("head")}-${urlSearchParams.get("hair")}.png`
  );
  link.setAttribute("href", imgData);
  link.click();
}

/**
 * Sequentially capture all hair variants for the current head.
 * For each iteration it renders the image, advances hair selection via a DOM click,
 * then waits a short delay to allow assets / renderer to update.
 * @async
 * @param {number} count Total number of hair variants to capture.
 * @returns {Promise<void>} Resolves when all variants captured.
 */
async function getHair(count) {
  for (let i = 0; i < count; i++) {
    renderImage();
    document.getElementById("next_hair").click();
    await new Promise((resolve, reject) => setTimeout(() => resolve(), 500));
  }
}

/**
 * Iterate through all heads; for each head capture every hair variant.
 * After finishing a head's hairs, advances to the next head via DOM click.
 * @async
 * @param {number} headCount Number of heads to iterate through.
 * @param {number} hairCount Number of hair variants per head.
 * @returns {Promise<void>} Resolves when all head/hair combinations are captured.
 */
const getHeads = async (headCount, hairCount) => {
  for (let i = 0; i < headCount; i++) {
    await getHair(hairCount);
    document.getElementById("next_head").click();
    await new Promise((resolve, reject) => setTimeout(() => resolve(), 500));
  }
};

/**
 * Determine how many hair options belong to a given race / filter string.
 * Filters option textContent containing the provided search substring.
 * @param {string} search Substring used to filter hair option text.
 * @returns {number} Count of matching hair options.
 */
function getHairCount(search) {
  const hairSelect = document.getElementById("part_1");
  const hairs = Array.from(hairSelect.querySelectorAll("option"))
    .map((n) => n.textContent)
    .filter((t) => t.includes(search));
  return hairs.length;
}

/**
 * Determine how many head options belong to a given race / filter string.
 * Filters option textContent containing the provided search substring.
 * @param {string} search Substring used to filter head option text.
 * @returns {number} Count of matching head options.
 */
function getHeadCount(search) {
  const headSelect = document.getElementById("part_2");
  const heads = Array.from(headSelect.querySelectorAll("option"))
    .map((n) => n.textContent)
    .filter((t) => t.includes(search));
  return heads.length;
}

/**
 * Convenience wrapper: compute head and hair counts for a race (filter string)
 * and then begin capturing all combinations.
 * @param {string} search Substring used to filter both head and hair option lists.
 * @returns {void}
 */
function getRace(search) {
  const headCount = getHeadCount(search);
  const hairCount = getHairCount(search);
  getHeads(headCount, hairCount);
}
