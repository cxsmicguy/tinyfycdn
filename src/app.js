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

// Middleware to set default image format
app.use(async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('Error: No image found');
    }

    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    req.defaultFormat = metadata.format.toLowerCase();
    next();
  } catch (error) {
    console.error(error);
    req.defaultFormat = 'png'; // Default to JPEG in case of an error
    next();
  }
});

// Define the route for image compression
app.post('/compress', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Error: No image found');
  }

  const { width, height, quality, format } = req.body;
  const defaultFormat = req.defaultFormat;

  try {
    const imageBuffer = req.file.buffer;
    const qualityValue = quality ? parseInt(quality) : 100;
    const formatOption = format || defaultFormat;

    const { width: originalWidth, height: originalHeight } = await sharp(imageBuffer).metadata();
    const inputWidth = width ? parseInt(width) : originalWidth;
    const inputHeight = height ? parseInt(height) : originalHeight;

    const resizedImage = await sharp(imageBuffer)
      .resize({ width: inputWidth, height: inputHeight })
      .toFormat(formatOption)
      .png({ quality: qualityValue })
      .toBuffer();

    const contentType = `image/${formatOption === 'input' ? defaultFormat : formatOption}`;
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