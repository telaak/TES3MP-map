scene.background = new THREE.Color(0x00ff00);

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

async function getHair(count) {
  for (let i = 0; i < count; i++) {
    renderImage();
    document.getElementById("next_hair").click();
    await new Promise((resolve, reject) => setTimeout(() => resolve(), 500));
  }
}

const getHeads = async (headCount, hairCount) => {
  for (let i = 0; i < headCount; i++) {
    await getHair(hairCount);
    document.getElementById("next_head").click();
    await new Promise((resolve, reject) => setTimeout(() => resolve(), 500));
  }
};

function getHairCount(search) {
  const hairSelect = document.getElementById("part_1");
  const hairs = Array.from(hairSelect.querySelectorAll("option"))
    .map((n) => n.textContent)
    .filter((t) => t.includes(search));
  return hairs.length;
}

function getHeadCount(search) {
  const headSelect = document.getElementById("part_2");
  const heads = Array.from(headSelect.querySelectorAll("option"))
    .map((n) => n.textContent)
    .filter((t) => t.includes(search));
  return heads.length;
}

function getRace(search) {
  const headCount = getHeadCount(search);
  const hairCount = getHairCount(search);
  getHeads(headCount, hairCount);
}
