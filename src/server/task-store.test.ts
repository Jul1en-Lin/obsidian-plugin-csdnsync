import { describe, expect, it } from 'vitest';
import { createTaskStore } from './task-store';

describe('task store', () => {
	it('creates a pending task and returns it by id', () => {
		const store = createTaskStore(() => 'sync_test');
		const task = store.create({
			title: 'Title',
			markdown: '# Title',
			sourcePath: 'note.md',
		});

		expect(task).toMatchObject({
			id: 'sync_test',
			status: 'pending',
			title: 'Title',
			markdown: '# Title',
			sourcePath: 'note.md',
		});
		expect(store.get('sync_test')).toBe(task);
	});

	it('records success results', () => {
		const store = createTaskStore(() => 'sync_test');
		store.create({
			title: 'Title',
			markdown: '# Title',
			sourcePath: 'note.md',
		});

		const updated = store.recordResult('sync_test', {
			status: 'success',
			postId: '123',
			postUrl: 'https://editor.csdn.net/md?articleId=123',
		});

		expect(updated?.status).toBe('success');
		expect(updated?.result).toEqual({
			status: 'success',
			postId: '123',
			postUrl: 'https://editor.csdn.net/md?articleId=123',
		});
	});

	it('returns null when recording a result for an unknown task', () => {
		const store = createTaskStore(() => 'sync_test');

		expect(
			store.recordResult('missing', {
				status: 'error',
				error: 'not found',
			}),
		).toBeNull();
	});
});
