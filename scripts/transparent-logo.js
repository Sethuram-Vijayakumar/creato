const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install jimp locally if not exists
try {
  require.resolve('jimp');
} catch (e) {
  console.log('Installing jimp for image processing...');
  execSync('npm install jimp@0.16.1', { stdio: 'inherit' });
}

const Jimp = require('jimp');

const logoPath = path.join(__dirname, '../public/logo.png');

Jimp.read(logoPath)
  .then(image => {
    console.log('Processing logo image pixels...');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      // If the pixel is white or very close to white, make it fully transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel = 0 (transparent)
      }
    });
    
    return image.writeAsync(logoPath);
  })
  .then(() => {
    console.log('Logo background removed successfully! Saved to public/logo.png');
  })
  .catch(err => {
    console.error('Error processing logo image:', err);
  });
