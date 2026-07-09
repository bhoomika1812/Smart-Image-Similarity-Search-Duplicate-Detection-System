const summary = document.getElementById("summary");
const upload = document.getElementById("upload");
const preview = document.getElementById("preview");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});
const resultsContainer = document.getElementById("results");

const bestMatchContainer =
document.getElementById("bestMatch");

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", function(){

    upload.value="";

    preview.src="";

    preview.style.display="none";

    bestMatchContainer.innerHTML="";

    resultsContainer.innerHTML="";

    summary.innerHTML="";

});

const databaseImages = [
    "images/cat1.jfif",
    "images/cat2.jfif",
    "images/cat3.jfif",
    "images/cat4.jfif",
    "images/dog1.jfif",
    "images/dog2.jfif",
    "images/dog3.jfif",
    "images/dog4.jfif",
];

function loadDatabaseImage(imagePath) {

    return new Promise((resolve) => {
        const img = new Image();
        img.src = imagePath;
        img.onload = async function () {
            resolve(img);
        };
        img.onerror = function () {
            console.error("Could not load image:", imagePath);
        };
    }
);
}

function generateHistogram(img) {
    // Set canvas size equal to image size
            canvas.width = img.width;
            canvas.height = img.height;

            console.log("Canvas Width:", canvas.width);
            console.log("Canvas Height:", canvas.height);

            // Draw image on canvas
            ctx.drawImage(img, 0, 0);

            // Read pixel data from canvas
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            console.log("Image Data:", imageData);

            // Store all pixel values
            const pixels = imageData.data;

            // Display the first pixel values
            console.log("First Pixel:");
            console.log("R =", pixels[0]);
            console.log("G =", pixels[1]);
            console.log("B =", pixels[2]);
            console.log("A =", pixels[3]);

            // -----------------------------
            // Create RGB Histogram Arrays
            // -----------------------------
            const redHistogram = new Array(256).fill(0);
            const greenHistogram = new Array(256).fill(0);
            const blueHistogram = new Array(256).fill(0);

            // Read every pixel and update histograms
            for (let i = 0; i < pixels.length; i += 4) {

                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                redHistogram[r]++;
                greenHistogram[g]++;
                blueHistogram[b]++;
            }

            return {
    redHistogram,
    greenHistogram,
    blueHistogram
};

}

function compareHistograms(histogram1, histogram2) {
    let distance = 0;
    for (let i = 0; i < 256; i++) {

    distance += Math.pow(
        histogram1.redHistogram[i] - histogram2.redHistogram[i],
        2
    );
}
for (let i = 0; i < 256; i++) {

    distance += Math.pow(
        histogram1.greenHistogram[i] - histogram2.greenHistogram[i],
        2
    );
}
for (let i = 0; i < 256; i++) {

    distance += Math.pow(
        histogram1.blueHistogram[i] - histogram2.blueHistogram[i],
        2
    );
}
distance = Math.sqrt(distance);
return distance;
}

function distanceToSimilarity(distance){

const similarity =
100/(1 + distance/1000);

return similarity;

}

function getSimilarityLabel(similarity){

    if(similarity>=90)
        return "Highly Similar";

    else if(similarity>=75)
        return "Very Similar";

    else if(similarity>=50)
        return "Moderately Similar";

    else if(similarity>=25)
        return "Low Similarity";

    else
        return "Different";

}

// When the user selects an image
upload.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (file) {

        // Create a temporary URL for the uploaded image
        const imageURL = URL.createObjectURL(file);

        // Display the uploaded image
        preview.src = imageURL;
        preview.style.display = "block";

        // Create an Image object
        const img = new Image();
        img.src = imageURL;

        // Wait until the image is fully loaded
        img.onload = async function () {

    const uploadedHistogram = generateHistogram(img);

    const resizedImage = resizeImage(img, 32, 32);
    console.log("Resized Image:");
    console.log(resizedImage);

    const grayscaleValues = convertToGrayscale(resizedImage);
    console.log("Grayscale Values:");
    console.log(grayscaleValues);

    const grayscaleMatrix = createMatrix(grayscaleValues);
    console.log("Grayscale Matrix:");
    console.log(grayscaleMatrix);

    const dctMatrix = calculateDCTMatrix(grayscaleMatrix);
    console.log("DCT Matrix:");
    console.log(dctMatrix);

    const lowFrequency = extractLowFrequency(dctMatrix);
    console.log("Low Frequency Block:");
    console.log(lowFrequency);

    const average = calculateAverage(lowFrequency);
    console.log("Average DCT Value:");
    console.log(average);

    const uploadedPHash = generatePHash(lowFrequency, average);
    console.log("Perceptual Hash:");
    console.log(uploadedPHash);
    console.log("Hash Length:", uploadedPHash.length);

    const uploadedDHash = generateImageDHash(img);
    console.log("Uploaded dHash:");
console.log(uploadedDHash);
console.log("dHash Length:", uploadedDHash.length);


    const results = [];
    

    for (const imagePath of databaseImages) {

        const databaseImg = await loadDatabaseImage(imagePath);

          // ---------- pHash ----------
        const databasePHash = generateImagePHash(databaseImg);

        const hammingDistance = calculateHammingDistance(
    uploadedPHash,
    databasePHash
);

const pHashSimilarity = hammingToSimilarity(hammingDistance);


// ---------- dHash ----------

const databaseDHash = generateImageDHash(databaseImg);
console.log(imagePath, "Database dHash:");
console.log(databaseDHash);

const dHashDistance = calculateHammingDistance(
    uploadedDHash,
    databaseDHash
);

console.log(imagePath, "dHash Distance:", dHashDistance);

const dHashSimilarity = hammingToSimilarity(
    dHashDistance
);


  // ---------- RGB ----------
        const databaseHistogram = generateHistogram(databaseImg);

        const distance = compareHistograms(
            uploadedHistogram,
            databaseHistogram
        );

        const rgbSimilarity = distanceToSimilarity(distance);

const combinedSimilarity = finalSimilarity(
        rgbSimilarity,
        pHashSimilarity,
        dHashSimilarity
    );

console.log(
    "pHash Similarity:",
    pHashSimilarity
);

console.log(
    imagePath,
    "Hamming Distance:",
    hammingDistance
);

        results.push({
            image: imagePath,
            distance: distance,
            hammingDistance: hammingDistance,
            rgbSimilarity: rgbSimilarity,
            pHashSimilarity: pHashSimilarity,
             combinedSimilarity: combinedSimilarity,
             dHashDistance: dHashDistance,
             dHashSimilarity: dHashSimilarity
        });

        console.log(imagePath, "Similarity Distance:", distance);
    }
    // console.log(results);
    
    // Sort the results according to distance
results.sort(
    (a, b) => b.combinedSimilarity - a.combinedSimilarity
);

summary.innerHTML = `
<h2>Search Summary</h2>

<p>Total Images : ${databaseImages.length}</p>

<p>Best Match : ${results[0].image}</p>

<p>Final Similarity :
${results[0].combinedSimilarity.toFixed(2)}%</p>
`;

console.log("Sorted Results:");
console.log(results);

// First image is the best match
const bestMatch = results[0];

// Display the Best Match
bestMatchContainer.innerHTML = `
<div class="card">
<img src="${bestMatch.image}" width="250">

<p>Similarity: ${distanceToSimilarity(bestMatch.distance).toFixed(2)}%</p>

<p>RGB Distance: ${bestMatch.distance.toFixed(2)}</p>

<p>pHash Distance: ${bestMatch.hammingDistance}</p>

<p>dHash Distance: ${bestMatch.dHashDistance}</p>
<p>dHash Similarity: ${bestMatch.dHashSimilarity.toFixed(2)}%</p>

<p>${getSimilarityLabel(distanceToSimilarity(bestMatch.distance))}</p>
</div>
`;

// Clear previous search results
resultsContainer.innerHTML = "";

// Display all images in ranked order
results.forEach((result, index) => {

    const similarity = distanceToSimilarity(result.distance);

const label = getSimilarityLabel(result.combinedSimilarity);

resultsContainer.innerHTML += `
<div class="card">

<img src="${result.image}" width="150">

<p><strong>Final Similarity:</strong>
${result.combinedSimilarity.toFixed(2)}%</p>

<p>RGB Distance: ${result.distance.toFixed(2)}</p>

<p>RGB Similarity: ${result.rgbSimilarity.toFixed(2)}%</p>

<p>pHash Similarity: ${result.pHashSimilarity.toFixed(2)}%</p>

<p>Hamming Distance: ${result.hammingDistance}</p>

<p>${getSimilarityLabel(result.combinedSimilarity)}</p>

</div>
`;

});

};

};

        }
);

function resizeImage(img, width, height) {

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return ctx.getImageData(0, 0, width, height);
}

function convertToGrayscale(imageData) {

    //get all pixels
    const pixels = imageData.data;

    const grayscaleValues = [];

    for (let i = 0; i < pixels.length; i += 4) {

        const r = pixels[i];

        const g = pixels[i + 1];

        const b = pixels[i + 2];

        //Calculate brightness
        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        //stores the gray value
        grayscaleValues.push(gray);
    }

    return grayscaleValues;
}

function createMatrix(grayscaleValues) {

    //create a empty matrix of 32 × 32 pixels
    const matrix = [];

    for (let row = 0; row < 32; row++) {

        matrix[row] = [];

        for (let col = 0; col < 32; col++) {

            matrix[row][col] = grayscaleValues[row * 32 + col];
            //grayscaleValues: This converts the flat array into a proper image matrix.

        }

    }

    return matrix;
}

function createDCTMatrix() {

    const dctMatrix = [];

    for (let row = 0; row < 32; row++) {

        dctMatrix[row] = [];

        for (let col = 0; col < 32; col++) {

            dctMatrix[row][col] = 0;

        }
    }

    return dctMatrix;
}

function calculateDCTCoefficient(matrix, u, v) {

    let sum = 0;

    for (let x = 0; x < 32; x++) {

        for (let y = 0; y < 32; y++) {

            sum +=
                matrix[x][y] *

                Math.cos(
                    ((2 * x + 1) * u * Math.PI) / 64   // calculates the cosine in the horizontal direction.
                ) *

                Math.cos(
                    ((2 * y + 1) * v * Math.PI) / 64   // calculates the cosine in the vertical direction.
                );

        }

    }

    return sum;
}

function calculateDCTMatrix(grayscaleMatrix) {

    const dctMatrix = createDCTMatrix();

    for (let u = 0; u < 32; u++) {

        for (let v = 0; v < 32; v++) {

            dctMatrix[u][v] =
                calculateDCTCoefficient(
                    grayscaleMatrix,
                    u,
                    v
                );              // Calculates one DCT value and stores it.

        }

    }

    return dctMatrix;
}

function extractLowFrequency(dctMatrix) {

    const lowFrequency = [];

    for (let i = 0; i < 8; i++) {

        lowFrequency[i] = [];

        for (let j = 0; j < 8; j++) {

            lowFrequency[i][j] = dctMatrix[i][j];

        }

    }

    return lowFrequency;
}

function calculateAverage(lowFrequency) {

    let sum = 0;
    let count = 0;

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            // Skip the DC coefficient
            if (i === 0 && j === 0)
                continue;

            sum += lowFrequency[i][j];
            count++;
        }
    }

    return sum / count;
}

function generatePHash(lowFrequency, average) {

    let hash = "";

    for (let i = 0; i < 8; i++) {

        for (let j = 0; j < 8; j++) {

            if (lowFrequency[i][j] > average) {

                hash += "1";

            } else {

                hash += "0";

            }

        }

    }

    return hash;

}

function calculateHammingDistance(hash1, hash2) {

    let distance = 0;

    for (let i = 0; i < hash1.length; i++) {

        if (hash1[i] !== hash2[i]) {

            distance++;

        }

    }

    return distance;
}

function hammingToSimilarity(hammingDistance) {

    return ((64 - hammingDistance) / 64) * 100;

}

function finalSimilarity(rgbSimilarity, pHashSimilarity) {

    const finalScore =
        (rgbSimilarity * 0.6) +
        (pHashSimilarity * 0.4);

    return finalScore;

}


function generateImagePHash(img) {

    const resizedImage = resizeImage(img, 32, 32);

    const grayscaleValues = convertToGrayscale(resizedImage);

    const grayscaleMatrix = createMatrix(grayscaleValues);

    const dctMatrix = calculateDCTMatrix(grayscaleMatrix);

    const lowFrequency = extractLowFrequency(dctMatrix);

    const average = calculateAverage(lowFrequency);

    const pHash = generatePHash(lowFrequency, average);

    return pHash;

}