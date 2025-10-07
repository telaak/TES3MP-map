/**
 * Script: crop.js
 * Purpose: Remove the green chroma background (#00FF00) from TES3MP head sprite PNGs
 *          and auto-crop them to the minimal bounding box, saving results into 'cropped/'.
 * Usage:   node crop.js  (expects existing directories: 'heads/' with source PNGs and 'cropped/' for output)
 * Process:
 *   1. Read all filenames in 'heads/'.
 *   2. For each image, replace every pixel exactly matching #00FF00 with full transparency (#00000000).
 *   3. Auto-crop transparent margins (Jimp's autocrop) to tightly wrap visible pixels.
 *   4. Write the processed PNG into 'cropped/' preserving the original filename.
 *
 * Dependencies:
 *   - replace-color: Performs color substitution using Jimp internally.
 *   - fs (Node core): Reads directory contents.
 */

import replaceColor from "replace-color";
import fs from "fs";

// Gather all source head sprite filenames from the 'heads' directory.
const heads = fs.readdirSync("heads");

/**
 * Iterate through all head images, remove the pure green background (#00FF00),
 * auto-crop transparent borders, and write the processed PNGs into the 'cropped' directory.
 *
 * @async
 * @returns {Promise<void>} Resolves when all head images have been processed.
 */
const parseHeads = async () => {
  for (const head of heads) {
    await replaceColor({
      image: "heads/" + head, // Input image path
      colors: {
        type: "hex", // Interpret target & replacement colors as hex strings
        targetColor: "#00FF00", // Pure green background to remove
        replaceColor: "#00000000", // Fully transparent (RGBA) replacement
      },
    })
      .then((jimpObject) => {
        // Remove any fully transparent borders to tightly wrap the head sprite.
        jimpObject.autocrop();
        // Persist processed image to the 'cropped' directory using the same filename.
        jimpObject.write("cropped/" + head, (err) => {
          if (err) return console.log(err);
        });
      })
      .catch((err) => {
        // Log and continue with remaining files.
        console.log(err);
      });
  }
};

parseHeads();
