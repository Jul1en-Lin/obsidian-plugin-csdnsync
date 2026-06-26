import type { App, TFile } from 'obsidian';
import type { SyncImageAsset } from '../types';

export interface MarkdownImageReference {
	full: string;
	alt: string;
	src: string;
	type: 'markdown' | 'wiki';
}

export interface PreparedMarkdownImages {
	markdown: string;
	images: SyncImageAsset[];
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const IMAGE_PLACEHOLDER_PREFIX = 'csdn-sync-image:';

export async function prepareMarkdownImages(
	app: App,
	sourceFile: TFile,
	markdown: string,
): Promise<PreparedMarkdownImages> {
	const references = parseMarkdownImageReferences(markdown);
	if (references.length === 0) {
		return { markdown, images: [] };
	}

	const images: SyncImageAsset[] = [];
	const imageByPath = new Map<string, SyncImageAsset>();
	let preparedMarkdown = markdown;

	for (const reference of references) {
		const file = resolveLocalImageFile(app, reference.src, sourceFile.path);
		if (!file) {
			continue;
		}

		let image = imageByPath.get(file.path);
		if (!image) {
			const id = `img_${images.length + 1}`;
			image = {
				id,
				placeholderSrc: `${IMAGE_PLACEHOLDER_PREFIX}${id}`,
				originalSrc: reference.src,
				sourcePath: file.path,
				filename: file.name,
				mimeType: getMimeType(file.extension),
				dataBase64: arrayBufferToBase64(await app.vault.readBinary(file)),
			};
			images.push(image);
			imageByPath.set(file.path, image);
		}

		preparedMarkdown = preparedMarkdown.replace(
			reference.full,
			createImagePlaceholderMarkdown(reference.alt, image.placeholderSrc),
		);
	}

	return { markdown: preparedMarkdown, images };
}

export function parseMarkdownImageReferences(
	markdown: string,
): MarkdownImageReference[] {
	return [
		...parseStandardMarkdownImages(markdown),
		...parseWikiImageEmbeds(markdown),
	].sort((a, b) => markdown.indexOf(a.full) - markdown.indexOf(b.full));
}

export function createImagePlaceholderMarkdown(
	alt: string,
	placeholderSrc: string,
): string {
	return `![${escapeMarkdownImageAlt(alt)}](${placeholderSrc})`;
}

function parseStandardMarkdownImages(markdown: string): MarkdownImageReference[] {
	const results: MarkdownImageReference[] = [];
	const len = markdown.length;
	let i = 0;

	while (i < len) {
		const start = markdown.indexOf('![', i);
		if (start === -1) {
			break;
		}

		const altStart = start + 2;
		const altEnd = findClosingBracket(markdown, altStart);
		if (altEnd === -1 || markdown[altEnd + 1] !== '(') {
			i = altStart;
			continue;
		}

		let k = altEnd + 2;
		while (k < len && /\s/.test(markdown[k] || '')) {
			k++;
		}

		const urlStart = k;
		let src = '';
		if (markdown[k] === '<') {
			const close = markdown.indexOf('>', k + 1);
			if (close === -1) {
				i = altEnd + 1;
				continue;
			}
			src = markdown.slice(k + 1, close);
			k = close + 1;
		} else {
			let depth = 0;
			while (k < len) {
				const ch = markdown[k] || '';
				if (ch === '\\') {
					k += 2;
					continue;
				}
				if (ch === '(') {
					depth++;
				} else if (ch === ')') {
					if (depth === 0) {
						break;
					}
					depth--;
				} else if (/\s/.test(ch) && depth === 0) {
					break;
				}
				k++;
			}
			src = markdown.slice(urlStart, k);
		}

		if (!src) {
			i = altEnd + 1;
			continue;
		}

		while (k < len && /\s/.test(markdown[k] || '')) {
			k++;
		}

		if (k < len && (markdown[k] === '"' || markdown[k] === "'")) {
			k = skipQuotedTitle(markdown, k);
			while (k < len && /\s/.test(markdown[k] || '')) {
				k++;
			}
		}

		if (markdown[k] !== ')') {
			i = altEnd + 1;
			continue;
		}

		results.push({
			full: markdown.slice(start, k + 1),
			alt: markdown.slice(altStart, altEnd),
			src,
			type: 'markdown',
		});
		i = k + 1;
	}

	return results;
}

function parseWikiImageEmbeds(markdown: string): MarkdownImageReference[] {
	const results: MarkdownImageReference[] = [];
	const wikiImageRegex = /!\[\[([^\]]+)]]/g;
	let match: RegExpExecArray | null;

	while ((match = wikiImageRegex.exec(markdown)) !== null) {
		const target = match[1] || '';
		const src = target.split('|')[0]?.trim() || '';
		if (!src) {
			continue;
		}
		results.push({
			full: match[0],
			alt: basenameWithoutExtension(src),
			src,
			type: 'wiki',
		});
	}

	return results;
}

function resolveLocalImageFile(
	app: App,
	src: string,
	sourcePath: string,
): TFile | null {
	if (isRemoteOrDataSource(src)) {
		return null;
	}

	const linkpath = safeDecodeURIComponent(src.trim());
	const resolved = app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
	if (isSupportedImageFile(resolved)) {
		return resolved;
	}

	for (const candidate of getFallbackImagePaths(linkpath, sourcePath)) {
		const file = app.vault.getAbstractFileByPath(candidate);
		if (isSupportedImageFile(file)) {
			return file;
		}
	}

	return null;
}

function getFallbackImagePaths(linkpath: string, sourcePath: string): string[] {
	const sourceDir = sourcePath.includes('/')
		? sourcePath.slice(0, sourcePath.lastIndexOf('/'))
		: '';
	return [
		normalizePath(linkpath),
		normalizePath(sourceDir ? `${sourceDir}/${linkpath}` : linkpath),
		normalizePath(sourceDir ? `${sourceDir}/assets/${linkpath}` : `assets/${linkpath}`),
	];
}

function isSupportedImageFile(file: unknown): file is TFile {
	if (!file || typeof file !== 'object') {
		return false;
	}

	const candidate = file as { extension?: unknown };
	return (
		typeof candidate.extension === 'string' &&
		IMAGE_EXTENSIONS.has(candidate.extension.toLowerCase())
	);
}

function isRemoteOrDataSource(src: string): boolean {
	return /^(https?:|data:|blob:|file:)/i.test(src);
}

function getMimeType(extension: string): string {
	const ext = extension.toLowerCase();
	if (ext === 'jpg') {
		return 'image/jpeg';
	}
	return `image/${ext}`;
}

function basenameWithoutExtension(src: string): string {
	const basename = src.split('/').pop() || src;
	return basename.replace(/\.[^.]+$/, '');
}

function escapeMarkdownImageAlt(alt: string): string {
	return alt.replace(/]/g, '\\]');
}

function findClosingBracket(markdown: string, start: number): number {
	for (let i = start; i < markdown.length; i++) {
		const ch = markdown[i];
		if (ch === '\\') {
			i++;
			continue;
		}
		if (ch === ']') {
			return i;
		}
	}
	return -1;
}

function skipQuotedTitle(markdown: string, start: number): number {
	const quote = markdown[start];
	let i = start + 1;
	while (i < markdown.length) {
		const ch = markdown[i];
		if (ch === '\\') {
			i += 2;
			continue;
		}
		if (ch === quote) {
			return i + 1;
		}
		i++;
	}
	return i;
}

function safeDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = '';
	for (const byte of new Uint8Array(buffer)) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function normalizePath(path: string): string {
	return path
		.replace(/\\/g, '/')
		.replace(/\/+/g, '/')
		.replace(/^\//, '');
}
