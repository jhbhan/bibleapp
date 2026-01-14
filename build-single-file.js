import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Run the Vite build with the single-file config
console.log('Building single HTML file...');
execSync('vite build --config vite.config.singlefile.js', { stdio: 'inherit' });
console.log('Build complete.');

// 2. Read the esv.json file
console.log('Reading esv.json...');
const esvData = fs.readFileSync('esv.json', 'utf-8');
console.log('esv.json read successfully.');

// 3. Read the generated index.html file
const htmlPath = path.join('html_build', 'index.html');
console.log(`Reading ${htmlPath}...`);
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
console.log('index.html read successfully.');

// 4. Inject the esv.json data into the HTML file
console.log('Injecting esv.json data...');
const injectionScript = `<script>window.BIBLE_DATA = ${esvData};</script>`;
htmlContent = htmlContent.replace('</body>', `${injectionScript}</body>`);
console.log('Data injected.');

// 5. Save the modified index.html file
console.log(`Saving modified ${htmlPath}...`);
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('Single HTML file created successfully!');
