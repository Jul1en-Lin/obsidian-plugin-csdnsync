import { describe, expect, it } from 'vitest';
import {
	createImagePlaceholderMarkdown,
	parseMarkdownImageReferences,
} from './images';

describe('Obsidian image extraction helpers', () => {
	it('parses markdown image references', () => {
		const markdown =
			'![hooklife2](hooklife2-20260427005958-h2xbhdu.png)\n![image](assets/a.png "title")';

		expect(parseMarkdownImageReferences(markdown)).toEqual([
			{
				alt: 'hooklife2',
				full: '![hooklife2](hooklife2-20260427005958-h2xbhdu.png)',
				src: 'hooklife2-20260427005958-h2xbhdu.png',
				type: 'markdown',
			},
			{
				alt: 'image',
				full: '![image](assets/a.png "title")',
				src: 'assets/a.png',
				type: 'markdown',
			},
		]);
	});

	it('parses Obsidian wiki image embeds', () => {
		expect(parseMarkdownImageReferences('![[Pasted image.png|433]]')).toEqual([
			{
				alt: 'Pasted image',
				full: '![[Pasted image.png|433]]',
				src: 'Pasted image.png',
				type: 'wiki',
			},
		]);
	});

	it('creates a standard markdown image for an internal placeholder', () => {
		expect(createImagePlaceholderMarkdown('my image', 'csdn-sync-image:img_1')).toBe(
			'![my image](csdn-sync-image:img_1)',
		);
	});
});
