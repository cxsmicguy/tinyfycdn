const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Set up a storage engine for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(express.static('public'));

// Define the route for image compression
app.post('/compress', upload.single('image'), async (req, res) => {
  const { width, height, quality } = req.body;

  if (!width || !height) {
    return res.status(400).send('Error: Width and height parameters are required');
  }

  try {
    const imageBuffer = req.file.buffer;
    const qualityValue = quality ? parseInt(quality) : 100; // Default quality is 100 if not specified

    // Perform image resizing and compression with the specified quality
    const resizedImage = await sharp(imageBuffer)
      .resize({ width: parseInt(width), height: parseInt(height) })
      .png({ quality: qualityValue }) // Set the quality for JPEG images
      .toBuffer();

    res.setHeader('Content-Type', 'image/jpeg'); // You can change the content type as needed
    res.send(resizedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the image');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
