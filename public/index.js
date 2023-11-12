// Add an event listener to display the uploaded image
const imageInput = document.getElementById('image');
const imageContainer = document.getElementById('imageContainer');
const uploadContainer = document.getElementById('uploadContainer');
const uploadedImage = document.getElementById('uploadedImage');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const qualityInput = document.getElementById('quality');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');
const clearButton = document.getElementById('clearButton');

const clearImage = () => {
    // Clear the image and associated data
    uploadedImage.src = '';  // Clear the image source
    widthInput.value = '';   // Clear the width input
    heightInput.value = '';  // Clear the height input
    qualityInput.value = ''; // Clear the quality input

    // Hide the image container and show the upload container
    imageContainer.style.display = 'none';
    uploadContainer.style.display = 'block';
};


const downloadImage = () => {
    if (uploadedImage.src) {
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = uploadedImage.src;
        a.download = 'compressed_image.jpg'; // You can specify the desired file name

        // Trigger a click event on the anchor element to initiate the download
        a.click();

        // Remove the temporary anchor element
        a.remove();
    } else {
        showToast('No image available to download', 'bg-blue-600');
    }
};


// Function to show the toast notification
function showToast(message, color) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (!!color) {
    toast.classList.add(color)
  }

  toastMessage.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
      toast.classList.add('hidden');
  }, 3000); // Hide the toast after 3 seconds (adjust as needed)
}

imageInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        const file = this.files[0];
        const objectURL = URL.createObjectURL(file);

        // Show the image container and set the image source
        uploadContainer.style.display = 'none';
        imageContainer.style.display = 'block';
        uploadedImage.src = objectURL;
    } else {
        // Hide the image container if no image selected
        uploadContainer.style.display = 'block';
        imageContainer.style.display = 'none'; // Change 'flex' to 'none'
    }
});

// Add an event listener to handle image compression using fetch
compressButton.addEventListener('click', async () => {
  if (!imageInput.files[0]) {
      showToast('Please select an image', 'bg-red-600');
      return;
  }

  if (
      parseInt(widthInput.value) < 60 ||
      parseInt(heightInput.value) < 60 ||
      widthInput.value === '' ||
      heightInput.value === ''
  ) {
      showToast('Width and height should be greater than or equal to 60', 'bg-red-600');
      return;
  }

  // Check if quality is less than 100
  if (!qualityInput.value || (parseInt(qualityInput.value) <= 100)) {
      const formData = new FormData();
      formData.append('image', imageInput.files[0]);
      formData.append('width', widthInput.value);
      formData.append('height', heightInput.value);
      formData.append('quality', qualityInput.value);

      try {
          const response = await fetch('/compress', {
              method: 'POST',
              body: formData,
          });

          if (response.ok) {
              const compressedImageBlob = await response.blob();
              const objectURL = URL.createObjectURL(compressedImageBlob);

              // Show the compressed image
              uploadedImage.src = objectURL;
          } else {
              const errorData = await response.json(); // Parse JSON response
              showToast(errorData.message || 'An error occurred while processing the image');
          }
      } catch (error) {
          console.error(error);
          showToast('An error occurred while compressing the image');
      }
  } else {
      showToast('Quality not more than 100', 'bg-red-600');
  }
});