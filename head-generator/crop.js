import Jimp from "jimp";
import replaceColor from "replace-color";
import fs from "fs";

const heads = fs.readdirSync("./new");

const parseHeads = async () => {
  for (const head of heads) {
    await replaceColor({
      image: "new/" + head,
      colors: {
        type: "hex",
        targetColor: "#00FF00",
        replaceColor: "#00000000",
      },
    })
      .then((jimpObject) => {
        jimpObject.autocrop();
        jimpObject.write("cropped/" + head, (err) => {
          if (err) return console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

parseHeads();
