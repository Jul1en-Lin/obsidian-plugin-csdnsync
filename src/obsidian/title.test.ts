import { describe, expect, it } from 'vitest';
import { extractTitle } from './title';

describe('extractTitle', () => {
	it('uses frontmatter title before headings and filename', () => {
		const markdown = [
			'---',
			'title: Frontmatter title',
			'---',
			'# Heading title',
		].join('\n');

		expect(extractTitle(markdown, 'Fallback.md')).toBe('Frontmatter title');
	});

	it('uses the filename before the first H1 heading', () => {
		expect(extractTitle('intro\n# Heading title\nbody', 'Fallback.md')).toBe(
			'Fallback',
		);
	});

	it('falls back to the first H1 heading when no filename is available', () => {
		expect(extractTitle('intro\n# Heading title\nbody', '')).toBe(
			'Heading title',
		);
	});

	it('falls back to the basename without markdown extension', () => {
		expect(extractTitle('plain body', 'Folder/Fallback note.md')).toBe(
			'Fallback note',
		);
	});
});
