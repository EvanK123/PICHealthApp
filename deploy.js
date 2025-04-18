const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the current branch
const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
console.log(`Current branch: ${branch}`);

// Set the base URL based on the branch
const baseUrl = branch === 'main' ? '/PIC-Health-MobApp' : '/PIC-Health-MobApp/dev';
console.log(`Setting base URL to: ${baseUrl}`);

// Update app.json with the correct base URL
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.experiments.baseUrl = baseUrl;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('Updated app.json with new base URL');

// Run the build
console.log(`Building for branch: ${branch}`);
console.log(`Base URL: ${baseUrl}`);
execSync('expo export -p web', { stdio: 'inherit' });

// Create a .nojekyll file to prevent GitHub Pages from processing the site
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('dist directory does not exist!');
  process.exit(1);
}

fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
console.log('Created .nojekyll file');

// Create a branch-specific file to help with debugging
fs.writeFileSync(
  path.join(distPath, 'branch-info.txt'),
  `Branch: ${branch}\nBase URL: ${baseUrl}\nBuild Time: ${new Date().toISOString()}`
);
console.log('Created branch-info.txt for debugging');

console.log('Build completed successfully!');