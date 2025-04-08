scene.background = new THREE.Color( 0x00FF00 );

function renderImage() { 
    const urlSearchParams = new URLSearchParams(window.location.href.slice(17).replace('#','?'));
    renderer.setSize(1264 / 3 , 947 / 3)
    renderer.render(scene, camera);
    const imgData = renderer.domElement.toDataURL();
    const link = document.createElement('a')
    link.setAttribute('download', `${urlSearchParams.get('head')}-${urlSearchParams.get('hair')}.png`)
    link.setAttribute('href', imgData)
    link.click()
}

async function getHair(count) {
    for (let i = 0; i < count; i++) {
        renderImage()
        document.getElementById('next_hair').click()
        await new Promise((resolve, reject) => setTimeout(() => resolve(), 300))
    }
}

const getHeads = async (headCount, hairCount) =>  {
    for (let i = 0; i < headCount; i++) {
        await getHair(hairCount)
        document.getElementById('next_head').click()
        await new Promise((resolve, reject) => setTimeout(() => resolve(), 300))
    }
}