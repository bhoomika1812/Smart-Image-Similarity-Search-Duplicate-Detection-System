const upload = document.getElementById("upload");
const preview = document.getElementById("preview");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});
const resultsContainer = document.getElementById("results");

const bestMatchContainer =
document.getElementById("bestMatch");

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

function resizeImage(img) {

    canvas.width = 32;
    canvas.height = 32;

    ctx.drawImage(img, 0, 0, 32, 32);

    const imageData = ctx.getImageData(
        0,
        0,
        32,
        32
    );

    return imageData;
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


    const resizedImage = resizeImage(img);
    console.log(resizedImage);


    const results = [];
    

    for (const imagePath of databaseImages) {

        const databaseImg = await loadDatabaseImage(imagePath);

        const databaseHistogram = generateHistogram(databaseImg);

        const distance = compareHistograms(
            uploadedHistogram,
            databaseHistogram
        );

        results.push({
            image: imagePath,
            distance: distance
        });

        console.log(imagePath, "Similarity Distance:", distance);
    }
    // console.log(results);
    
    // Sort the results according to distance
results.sort((a, b) => a.distance - b.distance);

console.log("Sorted Results:");
console.log(results);

// First image is the best match
const bestMatch = results[0];

// Display the Best Match
bestMatchContainer.innerHTML = `
<div class="card">
    <img src="${bestMatch.image}" width="250">
    <h3>Best Match</h3>
    <p>Distance: ${bestMatch.distance.toFixed(2)}</p>
</div>
`;

// Clear previous search results
resultsContainer.innerHTML = "";

// Display all images in ranked order
results.forEach((result, index) => {

    const similarity = distanceToSimilarity(result.distance);
    const bestSimilarity = distanceToSimilarity(bestMatch.distance);

const label = getSimilarityLabel(similarity);

    resultsContainer.innerHTML += `
    <div class="card">
        <h3>Rank ${index + 1}</h3>
        <img src="${result.image}" width="150">
        <p>Distance: ${result.distance.toFixed(2)}</p>
        <p>Similarity: ${similarity.toFixed(2)}%</p>
        <p>${label}</p>
    </div>
    `;

});

};

};

        }
);