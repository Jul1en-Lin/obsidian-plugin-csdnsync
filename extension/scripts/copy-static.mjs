import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await copyFile('manifest.json', 'dist/manifest.json');
await copyFile('src/popup/index.html', 'dist/popup.html');
await copyFile('src/popup/popup.css', 'dist/popup.css');
