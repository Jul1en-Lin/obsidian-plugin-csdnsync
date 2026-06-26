import { describe, expect, it } from 'vitest';
import { replaceImagePlaceholders } from './image-markdown';
import type { SyncImageAsset } from '../types';

describe('CSDN image markdown helpers', () => {
	it('replaces uploaded image placeholders', () => {
		const images: SyncImageAsset[] = [
			{
				id: 'img_1',
				placeholderSrc: 'csdn-sync-image:img_1',
				originalSrc: 'hooklife2.png',
				sourcePath: 'AI/assets/hooklife2.png',
				filename: 'hooklife2.png',
				mimeType: 'image/png',
				dataBase64: 'abc',
			},
		];

		expect(
			replaceImagePlaceholders(
				'![hook](csdn-sync-image:img_1)',
				images,
				new Map([['img_1', 'https://img-blog.csdnimg.cn/hook.png']]),
			),
		).toBe('![hook](https://img-blog.csdnimg.cn/hook.png)');
	});

	it('falls back to the original source when upload is missing', () => {
		const images: SyncImageAsset[] = [
			{
				id: 'img_1',
				placeholderSrc: 'csdn-sync-image:img_1',
				originalSrc: 'hooklife2.png',
				sourcePath: 'AI/assets/hooklife2.png',
				filename: 'hooklife2.png',
				mimeType: 'image/png',
				dataBase64: 'abc',
			},
		];

		expect(
			replaceImagePlaceholders(
				'![hook](csdn-sync-image:img_1)',
				images,
				new Map(),
			),
		).toBe('![hook](hooklife2.png)');
	});
});
