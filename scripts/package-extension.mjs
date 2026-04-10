import { createReadStream } from 'fs';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';

// Read version from manifest
const manifestPath = resolve('extension/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

const distDir = resolve('dist-extension');
const outputZip = resolve(`tabnova-extension-v${version}.zip`);

if (!existsSync(distDir)) {
  console.error('❌ dist-extension/ not found. Run npm run build:extension first.');
  process.exit(1);
}

// Use 'zip' CLI if available
try {
  execSync('which zip', { stdio: 'ignore' });
  execSync(`zip -r "${outputZip}" .`, { cwd: distDir, stdio: 'inherit' });
  console.log(`✅ Extension packaged: ${outputZip}`);
} catch {
  console.error('❌ zip command not found. Install zip or use a zip library.');
  process.exit(1);
}
