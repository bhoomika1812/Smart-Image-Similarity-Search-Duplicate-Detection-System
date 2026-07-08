function generateImageDHash(img) {

    const resizedImage = resizeImage(img, 9, 8);

    const grayscaleValues = convertToGrayscale(resizedImage);

    const dHash = generateDHash(grayscaleValues);

    return dHash;

}

function generateDHash(grayscaleValues) {

    let hash = "";

    return hash;

}


