import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';
import type { TaskStore } from './task-store';
import type { SyncTaskResult } from '../types';
import { isValidToken } from './token';

export interface LocalServerOptions {
	getToken(): string;
	taskStore: TaskStore;
	onResult(taskId: string, result: SyncTaskResult): void;
}

export class LocalServer {
	private server: Server | null = null;

	constructor(private readonly options: LocalServerOptions) {}

	async start(port: number): Promise<void> {
		await this.stop();

		this.server = createServer((request, response) => {
			this.handle(request, response).catch((error) => {
				writeJson(response, 500, {
					error: error instanceof Error ? error.message : String(error),
				});
			});
		});

		await new Promise<void>((resolve, reject) => {
			this.server?.once('error', reject);
			this.server?.listen(port, '127.0.0.1', () => {
				this.server?.off('error', reject);
				resolve();
			});
		});
	}

	async stop(): Promise<void> {
		if (!this.server) {
			return;
		}

		const server = this.server;
		this.server = null;
		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
	}

	getUrl(): string | null {
		const address = this.server?.address();
		if (!address || typeof address === 'string') {
			return null;
		}
		return `http://127.0.0.1:${address.port}`;
	}

	private async handle(
		request: IncomingMessage,
		response: ServerResponse,
	): Promise<void> {
		const method = request.method || 'GET';
		const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');

		setCorsHeaders(response);

		if (method === 'OPTIONS') {
			response.writeHead(204);
			response.end();
			return;
		}

		if (method === 'GET' && requestUrl.pathname === '/health') {
			writeJson(response, 200, { ok: true, plugin: 'csdn-sync' });
			return;
		}

		if (method === 'GET' && requestUrl.pathname === '/trigger') {
			const taskId = requestUrl.searchParams.get('taskId') || '';
			writeHtml(response, renderTriggerPage(taskId));
			return;
		}

		if (!this.hasValidToken(request)) {
			writeJson(response, 401, { error: 'Invalid token' });
			return;
		}

		const taskMatch = requestUrl.pathname.match(/^\/tasks\/([^/]+)$/);
		const resultMatch = requestUrl.pathname.match(/^\/tasks\/([^/]+)\/result$/);

		if (method === 'GET' && taskMatch?.[1]) {
			const task = this.options.taskStore.get(decodeURIComponent(taskMatch[1]));
			if (!task) {
				writeJson(response, 404, { error: 'Task not found' });
				return;
			}
			writeJson(response, 200, task);
			return;
		}

		if (method === 'POST' && resultMatch?.[1]) {
			const body = await readJson<SyncTaskResult>(request);
			const task = this.options.taskStore.recordResult(
				decodeURIComponent(resultMatch[1]),
				body,
			);
			if (!task) {
				writeJson(response, 404, { error: 'Task not found' });
				return;
			}
			this.options.onResult(task.id, body);
			writeJson(response, 200, { ok: true });
			return;
		}

		writeJson(response, 404, { error: 'Not found' });
	}

	private hasValidToken(request: IncomingMessage): boolean {
		const header = request.headers['x-csdnsync-token'];
		const provided = Array.isArray(header) ? header[0] : header;
		return isValidToken(provided, this.options.getToken());
	}
}

function setCorsHeaders(response: ServerResponse): void {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSDNSync-Token');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function writeJson(
	response: ServerResponse,
	statusCode: number,
	payload: unknown,
): void {
	response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
	response.end(JSON.stringify(payload));
}

function writeHtml(response: ServerResponse, html: string): void {
	response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
	response.end(html);
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
	const chunks: Buffer[] = [];
	for await (const chunk of request) {
		chunks.push(
			typeof chunk === 'string'
				? Buffer.from(chunk)
				: Buffer.from(chunk as Uint8Array),
		);
	}
	return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

function renderTriggerPage(taskId: string): string {
	const escapedTaskId = escapeHtml(taskId);
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CSDN Sync</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
	<main>
		<h1>CSDN Sync</h1>
		<p data-csdn-sync-task-id="${escapedTaskId}">Waiting for the Chrome extension...</p>
	</main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
