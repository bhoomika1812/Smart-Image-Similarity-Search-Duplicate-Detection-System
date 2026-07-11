function extractFeatures(img) {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = 256;
    canvas.height = 256;

    ctx.drawImage(img, 0, 0, 256, 256);

    const imageData = ctx.getImageData(0, 0, 256, 256).data;

    const brightness = calculateBrightness(imageData);
    const contrast = calculateContrast(imageData);
    const edgeDensity = calculateEdgeDensity(imageData, 256, 256);

    return {
        brightness,
        contrast,
        edgeDensity
    };

}

function calculateBrightness(data) {

    let total = 0;

    for (let i = 0; i < data.length; i += 4) {

        const gray =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];

        total += gray;
    }

    return total / (data.length / 4);

}