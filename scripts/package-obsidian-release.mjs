import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const releaseRoot = 'release';
const releaseDir = path.join(releaseRoot, `${manifest.id}-${manifest.version}`);
const zipName = `${manifest.id}-${manifest.version}.zip`;
const zipPath = path.join(releaseRoot, zipName);
const requiredAssets = ['main.js', 'manifest.json'];
const optionalAssets = ['styles.css'];

async function exists(file) {
	try {
		await stat(file);
		return true;
	} catch {
		return false;
	}
}

await rm(releaseDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(releaseDir, { recursive: true });

for (const asset of requiredAssets) {
	if (!(await exists(asset))) {
		throw new Error(`Missing required release asset: ${asset}`);
	}
	await copyFile(asset, path.join(releaseDir, asset));
}

for (const asset of optionalAssets) {
	if (await exists(asset)) {
		await copyFile(asset, path.join(releaseDir, asset));
	}
}

const zipResult = spawnSync('zip', ['-qr', `../${zipName}`, '.'], {
	cwd: releaseDir,
	stdio: 'inherit',
});

if (zipResult.status !== 0) {
	throw new Error('Failed to create Obsidian release zip.');
}

console.log(`Created ${releaseDir}`);
console.log(`Created ${zipPath}`);
