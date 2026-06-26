import { App, TFile } from 'obsidian';
import type { SyncTaskInput } from '../types';
import { prepareMarkdownImages } from './images';
import { extractTitle } from './title';

export async function extractActiveNote(app: App): Promise<SyncTaskInput> {
	const file = app.workspace.getActiveFile();
	if (!isMarkdownFile(file)) {
		throw new Error('Open a Markdown note before syncing.');
	}

	const markdown = await app.vault.read(file);
	const title = extractTitle(markdown, file.path);
	const prepared = await prepareMarkdownImages(app, file, markdown);

	return {
		title,
		markdown: prepared.markdown,
		images: prepared.images,
		sourcePath: file.path,
	};
}

function isMarkdownFile(file: TFile | null): file is TFile {
	return Boolean(file && file.extension.toLowerCase() === 'md');
}
