const myImage = document.querySelector("#my_image");
const originalImageContainer = document.querySelector("#original_image_container");
const compressedImageContainer = document.querySelector("#compressed_image_container");

myImage.addEventListener("change", (evt) => {
    const image = evt.target.files[0];
    const originalImageSize = (image.size / 1024).toFixed(2); // size in KB

    const reader = new FileReader();
    reader.onload = () => {
        const newImage = new Image();
        newImage.src = reader.result;
        newImage.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.height = newImage.height;
            canvas.width = newImage.width;
            const ctx = canvas.getContext('2d');

            newImage.width = 150;
            originalImageContainer.innerHTML = ''; // Clear previous content
            originalImageContainer.appendChild(newImage);

            const originalSizeText = document.createElement('p');
            originalSizeText.textContent = `Original Image Size: ${originalImageSize} KB`;
            originalImageContainer.appendChild(originalSizeText);

            ctx.drawImage(newImage, 0, 0);

            const compressImage = (quality) => {
                return new Promise((resolve) => {
                    canvas.toBlob((blob) => {
                        const compressedImageSize = (blob.size / 1024).toFixed(2); // size in KB
                        resolve({ blob, compressedImageSize });
                    }, 'image/jpeg', quality);
                });
            };

            const compressToTargetSize = async () => {
                let quality = 0.7;
                let compressedImageData;
                do {
                    compressedImageData = await compressImage(quality);
                    quality -= 0.1;
                } while (compressedImageData.blob.size > image.size / 2 && quality > 0);

                const newUrl = URL.createObjectURL(compressedImageData.blob);

                compressedImageContainer.innerHTML = `<img src="${newUrl}" width="150">`;

                const compressedSizeText = document.createElement('p');
                compressedSizeText.textContent = `Compressed Image Size: ${compressedImageData.compressedImageSize} KB`;
                compressedImageContainer.appendChild(compressedSizeText);

                // Create and add download button
                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Download Compressed Image';
                downloadButton.style.backgroundColor = 'blue';
                downloadButton.style.color = 'white';
                downloadButton.style.border = 'none';
                downloadButton.style.padding = '10px';
                downloadButton.style.marginTop = '10px';
                downloadButton.style.cursor = 'pointer';
                downloadButton.addEventListener('click', () => downloadImage(newUrl));
                compressedImageContainer.appendChild(downloadButton);
            };

            compressToTargetSize();
        };
    };
    reader.readAsDataURL(image);
});

const downloadImage = (url) => {
    const a = document.createElement('a');
    a.download = 'compressed_image.jpeg';
    a.href = url;
    a.target = '_blank';
    a.click();
};
