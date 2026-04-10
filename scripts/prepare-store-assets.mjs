import { existsSync } from 'fs';
import { resolve } from 'path';

const required = [
  'extension/public/icons/icon-16.png',
  'extension/public/icons/icon-32.png',
  'extension/public/icons/icon-48.png',
  'extension/public/icons/icon-128.png',
  'extension/manifest.json',
  'dist-extension/popup.js',
  'dist-extension/dashboard.js',
  'dist-extension/background.js',
];

let allOk = true;

for (const file of required) {
  const path = resolve(file);
  if (existsSync(path)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n❌ Some required files are missing. Build the extension first.');
  process.exit(1);
} else {
  console.log('\n✅ All store assets are ready!');
}
