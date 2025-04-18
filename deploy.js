const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the current branch
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

// Set the base URL based on the branch
const baseUrl = branch === 'main' ? '/PIC-Health-MobApp' : '/PIC-Health-MobApp/dev';

// Update app.json with the correct base URL
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.experiments.baseUrl = baseUrl;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

// Run the build
console.log(`Building for branch: ${branch}`);
console.log(`Base URL: ${baseUrl}`);
execSync('expo export -p web', { stdio: 'inherit' });

// Create a .nojekyll file to prevent GitHub Pages from processing the site
fs.writeFileSync(path.join(__dirname, 'dist', '.nojekyll'), '');

console.log('Build completed successfully!'); 