function generateImageDHash(img) {

    const resizedImage = resizeImage(img, 9, 8);

    const grayscaleValues = convertToGrayscale(resizedImage);

    const dHash = generateDHash(grayscaleValues);

    return dHash;

}

function generateDHash(grayscaleValues) {

    let hash = "";

    for (let row = 0; row < 8; row++) {

        const rowStart = row * 9;

        for (let col = 0; col < 8; col++) {

            const left = grayscaleValues[rowStart + col];
            const right = grayscaleValues[rowStart + col + 1];

            if (left < right) {
                hash += "1";
            } else {
                hash += "0";
            }
        }
    }

    return hash;
}



