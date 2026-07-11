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

/*it returns average brightness of the image, which is calculated by converting 
each pixel to grayscale and averaging the values.*/

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

//Higher contrast → larger value.

function calculateContrast(data) {

    let brightness = [];

    for (let i = 0; i < data.length; i += 4) {

        const gray =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];

        brightness.push(gray);
    }

    const mean =
        brightness.reduce((a, b) => a + b, 0) /
        brightness.length;

    let variance = 0;

    brightness.forEach(value => {
        variance += Math.pow(value - mean, 2);
    });

    variance /= brightness.length;

    return Math.sqrt(variance);

}

/*This estimates how detailed the image is. Busy textures (grass, fur, leaves)
 produce a higher edge density than smooth areas (sky, plain walls).*/

function calculateEdgeDensity(data, width, height) {

    let edges = 0;

    for (let y = 0; y < height - 1; y++) {

        for (let x = 0; x < width - 1; x++) {

            const index = (y * width + x) * 4;

            const gray =
                0.299 * data[index] +
                0.587 * data[index + 1] +
                0.114 * data[index + 2];

            const right =
                0.299 * data[index + 4] +
                0.587 * data[index + 5] +
                0.114 * data[index + 6];

            if (Math.abs(gray - right) > 30) {
                edges++;
            }

        }

    }

    return edges / (width * height);

}

//feature comparison function that returns a similarity score between 0 and 100.
//higher score indicates more similarity.
function compareFeatures(feature1, feature2) {

    const brightnessDiff = Math.abs(feature1.brightness - feature2.brightness);
    const contrastDiff = Math.abs(feature1.contrast - feature2.contrast);
    const edgeDiff = Math.abs(feature1.edgeDensity - feature2.edgeDensity);

    // Normalize differences
    const brightnessScore = Math.max(0, 100 - (brightnessDiff / 255) * 100);

    const contrastScore = Math.max(0, 100 - (contrastDiff / 128) * 100);

    const edgeScore = Math.max(0, 100 - (edgeDiff * 100));

    const finalScore =
        (brightnessScore * 0.4) +
        (contrastScore * 0.3) +
        (edgeScore * 0.3);

    return finalScore;
}