import { describe, expect, it } from 'vitest';
import { createDraftPayload } from './payload';

describe('createDraftPayload', () => {
	it('maps a sync task to CSDN draft fields', () => {
		expect(
			createDraftPayload(
				{
					id: 'sync_1',
					title: 'Title',
					markdown: '# Title',
					sourcePath: 'note.md',
					createdAt: '2026-06-26T00:00:00.000Z',
				},
				'<h1>Title</h1>',
			),
		).toMatchObject({
			title: 'Title',
			markdowncontent: '# Title',
			content: '<h1>Title</h1>',
			status: 2,
			pubStatus: 'draft',
			source: 'pc_mdeditor',
			is_new: 1,
		});
	});
});
