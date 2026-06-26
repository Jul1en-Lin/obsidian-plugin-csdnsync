import type { SyncTask, SyncTaskResult } from './types';
import type { ExtensionSettings } from './settings';

export async function checkHealth(settings: ExtensionSettings): Promise<boolean> {
	const response = await fetch(`${settings.obsidianBaseUrl}/health`);
	if (!response.ok) {
		return false;
	}

	const body = (await response.json()) as { ok?: boolean };
	return body.ok === true;
}

export async function getTask(
	settings: ExtensionSettings,
	taskId: string,
): Promise<SyncTask> {
	const response = await fetch(
		`${settings.obsidianBaseUrl}/tasks/${encodeURIComponent(taskId)}`,
		{
			headers: authHeaders(settings),
		},
	);

	if (!response.ok) {
		throw new Error(`Obsidian task request failed: ${response.status}`);
	}

	return (await response.json()) as SyncTask;
}

export async function postTaskResult(
	settings: ExtensionSettings,
	taskId: string,
	result: SyncTaskResult,
): Promise<void> {
	const response = await fetch(
		`${settings.obsidianBaseUrl}/tasks/${encodeURIComponent(taskId)}/result`,
		{
			method: 'POST',
			headers: {
				...authHeaders(settings),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(result),
		},
	);

	if (!response.ok) {
		throw new Error(`Obsidian result request failed: ${response.status}`);
	}
}

function authHeaders(settings: ExtensionSettings): Record<string, string> {
	return {
		'X-CSDNSync-Token': settings.token,
	};
}
