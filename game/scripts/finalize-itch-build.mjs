import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../itch-build');
const itchHtml = path.join(root, 'index.itch.html');
const indexHtml = path.join(root, 'index.html');

if (!fs.existsSync(itchHtml)) {
  console.error('finalize-itch-build: missing', itchHtml);
  process.exit(1);
}

fs.renameSync(itchHtml, indexHtml);

for (const name of ['CNAME', 'robots.txt', 'sitemap.xml', 'llms.txt', 'LLM.txt', '.DS_Store']) {
  const p = path.join(root, name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

const html = fs.readFileSync(indexHtml, 'utf8');
if (html.includes('src="/assets/') || html.includes('href="/assets/')) {
  console.error('finalize-itch-build: index.html still has absolute /assets paths');
  process.exit(1);
}

const assetsDir = path.join(root, 'assets');
const jsFile = fs.readdirSync(assetsDir).find((f) => f.startsWith('index.itch-') && f.endsWith('.js'));
if (jsFile) {
  const js = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  if (!js.includes('script.google.com/macros/s/')) {
    console.error(
      '\nfinalize-itch-build: Google Sheets is NOT configured for this itch build.\n' +
        '  1. cp .env.itch.example .env.itch\n' +
        '  2. Set VITE_SHEETS_SECRET (same as SUBMIT_SECRET in Apps Script)\n' +
        '  3. npm run build:itch\n',
    );
    process.exit(1);
  }
}

console.log('itch-build ready:', root);
