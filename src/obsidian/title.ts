export function extractTitle(markdown: string, sourcePath: string): string {
	const frontmatterTitle = extractFrontmatterTitle(markdown);
	if (frontmatterTitle) {
		return frontmatterTitle;
	}

	const filenameTitle = basenameWithoutMarkdownExtension(sourcePath).trim();
	if (filenameTitle) {
		return filenameTitle;
	}

	const headingTitle = extractFirstH1(markdown);
	if (headingTitle) {
		return headingTitle;
	}

	return 'Untitled note';
}

function extractFrontmatterTitle(markdown: string): string | null {
	if (!markdown.startsWith('---')) {
		return null;
	}

	const end = markdown.indexOf('\n---', 3);
	if (end === -1) {
		return null;
	}

	const frontmatter = markdown.slice(3, end).split(/\r?\n/);
	for (const line of frontmatter) {
		const match = line.match(/^title:\s*(.+?)\s*$/);
		if (!match?.[1]) {
			continue;
		}
		return stripQuotes(match[1].trim());
	}

	return null;
}

function extractFirstH1(markdown: string): string | null {
	for (const line of markdown.split(/\r?\n/)) {
		const match = line.match(/^#\s+(.+?)\s*$/);
		if (match?.[1]) {
			return match[1].trim();
		}
	}

	return null;
}

function basenameWithoutMarkdownExtension(sourcePath: string): string {
	const filename = sourcePath.split('/').pop() || sourcePath;
	return filename.replace(/\.md$/i, '');
}

function stripQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}
