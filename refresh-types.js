// This script will help refresh TypeScript type checking
const fs = require('fs');
const path = require('path');

// Touch tsconfig.json to trigger TypeScript server reload
const tsConfigPath = path.join(__dirname, 'tsconfig.json');
const now = new Date();

try {
  fs.utimesSync(tsConfigPath, now, now);
  console.log('TypeScript configuration updated. Your editor should pick up the changes shortly.');
} catch (err) {
  console.error('Error updating TypeScript configuration:', err);
  console.log('Please restart your TypeScript server manually.');
}

// Create a temporary file to help with module resolution
const tempFile = path.join(__dirname, 'src', 'types', '__temp__.ts');
fs.writeFileSync(tempFile, '// Temporary file for TypeScript module resolution', 'utf8');

// Clean up after a short delay
setTimeout(() => {
  try {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}, 5000);
