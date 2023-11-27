const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const app = express();
const port = 3000;

// Set up a storage engine for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(express.static('public'));

// Function to check if the file format is supported
const isSupportedFormat = (filename) => {
  const supportedFormats = ['webp', 'png', 'jpeg', 'jpg'];
  const format = filename.split('.').pop().toLowerCase();
  return supportedFormats.includes(format);
};

// Endpoint for image compression
app.post('/compress', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Error: No image found');
  }

  // Check if the format is supported
  if (!isSupportedFormat(req.file.originalname)) {
    return res.status(400).send('Error: Unsupported image format');
  }

  const { width, height, quality, format: requestedFormat } = req.body;
  const qualityValue = quality ? parseInt(quality) : 100;
  const format = requestedFormat || req.file.originalname.split('.').pop().toLowerCase();

  try {
    const { width: originalWidth, height: originalHeight } = await sharp(req.file.buffer).metadata();

    const resizedImage = await sharp(req.file.buffer)
      .resize({ width: parseInt(width || originalWidth), height: parseInt(height || originalHeight) })
      .toFormat(format)
      .png({ quality: qualityValue })
      .toBuffer();

    const contentType = `image/${format}`;
    res.setHeader('Content-Type', contentType);
    res.send(resizedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the image');
  }
});

// Endpoint for getting image metadata
app.get('/metadata', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Error: No image found');
  }

  // Check if the format is supported
  if (!isSupportedFormat(req.file.originalname)) {
    return res.status(400).send('Error: Unsupported image format');
  }

  try {
    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    res.json(metadata);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting image metadata');
  }
});

// Endpoint for rotating images
app.post('/rotate', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Error: No image found');
  }

  // Check if the format is supported
  if (!isSupportedFormat(req.file.originalname)) {
    return res.status(400).send('Error: Unsupported image format');
  }

  const { angle } = req.body;
  const defaultFormat = req.defaultFormat;

  try {
    const imageBuffer = req.file.buffer;
    const rotatedImage = await sharp(imageBuffer).rotate(parseInt(angle)).toBuffer();
    res.setHeader('Content-Type', `image/${defaultFormat}`);
    res.send(rotatedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rotating the image');
  }
});

// Endpoint for flipping images
app.post('/flip', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Error: No image found');
  }

  // Check if the format is supported
  if (!isSupportedFormat(req.file.originalname)) {
    return res.status(400).send('Error: Unsupported image format');
  }

  const { direction } = req.body; // 'horizontal' or 'vertical'
  const defaultFormat = req.defaultFormat;

  try {
    const imageBuffer = req.file.buffer;
    const flippedImage = await sharp(imageBuffer)[`flip${direction === 'vertical' ? 'Y' : 'X'}`]().toBuffer();
    res.setHeader('Content-Type', `image/${defaultFormat}`);
    res.send(flippedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error flipping the image');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});