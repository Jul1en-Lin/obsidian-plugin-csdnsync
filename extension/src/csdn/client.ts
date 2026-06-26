import type { SyncTask } from '../types';
import { markdownToHtml } from '../markdown';
import { withCsdnHeaderRules } from './headers';
import { createDraftPayload } from './payload';
import { createSignedHeaders } from './sign';

const CSDN_API_BASE = 'https://bizapi.csdn.net';
const AUTH_PATH = '/blog-console-api/v3/editor/getBaseInfo';
const SAVE_PATH = '/blog-console-api/v3/mdeditor/saveArticle';

export interface CsdnDraftResult {
	postId: string;
	postUrl: string;
}

export async function saveDraftToCsdn(
	task: SyncTask,
): Promise<CsdnDraftResult> {
	return withCsdnHeaderRules(async () => {
		await ensureAuthenticated();

		const html = markdownToHtml(task.markdown);
		const headers = await createSignedHeaders(SAVE_PATH, 'POST');
		const response = await fetch(`${CSDN_API_BASE}${SAVE_PATH}`, {
			method: 'POST',
			credentials: 'include',
			headers,
			body: JSON.stringify(createDraftPayload(task, html)),
		});

		const body = (await response.json()) as {
			code?: number;
			message?: string;
			msg?: string;
			data?: { id?: string };
		};

		if (body.code !== 200 || !body.data?.id) {
			throw new Error(body.msg || body.message || '保存 CSDN 草稿失败');
		}

		return {
			postId: body.data.id,
			postUrl: `https://editor.csdn.net/md?articleId=${body.data.id}`,
		};
	});
}

async function ensureAuthenticated(): Promise<void> {
	const headers = await createSignedHeaders(AUTH_PATH, 'GET');
	const response = await fetch(`${CSDN_API_BASE}${AUTH_PATH}`, {
		method: 'GET',
		credentials: 'include',
		headers,
	});

	const body = (await response.json()) as {
		code?: number;
		data?: { name?: string };
	};

	if (body.code !== 200 || !body.data?.name) {
		throw new Error('请先在 Chrome 中登录 CSDN');
	}
}
