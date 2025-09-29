// This script will help restart the TypeScript server
const { exec } = require('child_process');

console.log('Restarting TypeScript server...');

// For VS Code
exec('code --restart-extension vscode.typescript-language-features', (error) => {
  if (error) {
    console.log('VS Code TypeScript extension restart command not found. If you\'re using a different editor, please restart your TypeScript server manually.');
  } else {
    console.log('VS Code TypeScript server restarted successfully!');
  }
});

// For other editors or as a fallback
console.log('Please ensure your editor\'s TypeScript server is restarted for the changes to take effect.');
