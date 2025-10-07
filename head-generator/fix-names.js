import fs from "fs";

const path = "../next/public/head";

const heads = fs.readdirSync(path);

for (const head of heads) {
  if (head.match(/head[0-9]/)) {
    const newHead = head.replace("head", "head_");
    fs.renameSync(`${path}/${head}`, `${path}/${newHead}`);
  }
}
