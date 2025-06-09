#!/usr/bin/env node
// convert-image.js
// Usage: node convert-image.js <inputImage> <outputFormat>
// Example: node convert-image.js myphoto.jpg png

import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

if (process.argv.length < 4) {
    console.error('Usage: node convert-image.js <inputImage> <outputFormat>');
    process.exit(1);
}

const indexOffset = process.argv.includes('--') ? 1 : 0;
const inputImage = process.argv[2 + indexOffset];
const outputFormat = process.argv[3 + indexOffset].toLowerCase();

const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'avif', 'gif', 'heif'];
if (!validFormats.includes(outputFormat)) {
    console.error(`Invalid output format. Supported formats: ${validFormats.join(', ')}; Given format: ${outputFormat}`);
    process.exit(1);
}

if (!fs.existsSync(inputImage)) {
    console.error('Input file does not exist:', inputImage);
    process.exit(1);
}

const { name } = path.parse(inputImage);
const outputImage = `${name}.${outputFormat}`;

sharp(inputImage)
[outputFormat]()
    .toFile(outputImage)
    .then(() => {
        console.log(`Converted ${inputImage} to ${outputImage}`);
    })
    .catch(err => {
        console.error('Error during conversion:', err);
        process.exit(1);
    });
