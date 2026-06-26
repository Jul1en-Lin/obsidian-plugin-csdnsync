import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalServer } from './local-server';
import { createTaskStore } from './task-store';

let server: LocalServer | null = null;

afterEach(async () => {
	await server?.stop();
	server = null;
});

describe('LocalServer', () => {
	it('serves health without exposing task content', async () => {
		server = createTestServer();
		await server.start(0);

		const response = await fetch(`${server.getUrl()}/health`);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true, plugin: 'csdn-sync' });
	});

	it('requires a token for task reads', async () => {
		const store = createTaskStore(() => 'sync_test');
		store.create({
			title: 'Title',
			markdown: '# Title',
			sourcePath: 'note.md',
		});
		server = createTestServer(store);
		await server.start(0);

		const response = await fetch(`${server.getUrl()}/tasks/sync_test`);

		expect(response.status).toBe(401);
	});

	it('returns a task and records the result with a valid token', async () => {
		const onResult = vi.fn();
		const store = createTaskStore(() => 'sync_test');
		store.create({
			title: 'Title',
			markdown: '# Title',
			sourcePath: 'note.md',
		});
		server = createTestServer(store, onResult);
		await server.start(0);

		const taskResponse = await fetch(`${server.getUrl()}/tasks/sync_test`, {
			headers: { 'X-CSDNSync-Token': 'secret' },
		});
		const resultResponse = await fetch(`${server.getUrl()}/tasks/sync_test/result`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSDNSync-Token': 'secret',
			},
			body: JSON.stringify({
				status: 'success',
				postUrl: 'https://editor.csdn.net/md?articleId=123',
			}),
		});

		expect(taskResponse.status).toBe(200);
		expect(await taskResponse.json()).toMatchObject({ id: 'sync_test' });
		expect(resultResponse.status).toBe(200);
		expect(onResult).toHaveBeenCalledWith('sync_test', {
			status: 'success',
			postUrl: 'https://editor.csdn.net/md?articleId=123',
		});
	});
});

function createTestServer(
	taskStore = createTaskStore(() => 'sync_test'),
	onResult = vi.fn(),
): LocalServer {
	return new LocalServer({
		getToken: () => 'secret',
		taskStore,
		onResult,
	});
}
