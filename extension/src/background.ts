import { getTask, postTaskResult } from './obsidian-api';
import { loadSettings } from './settings';
import { saveDraftToCsdn } from './csdn/client';

interface StartSyncMessage {
	type: 'START_CSDN_SYNC';
	taskId: string;
}

chrome.runtime.onMessage.addListener((message: StartSyncMessage, _sender, sendResponse) => {
	if (message?.type !== 'START_CSDN_SYNC') {
		return false;
	}

	handleStartSync(message.taskId)
		.then((result) => sendResponse(result))
		.catch((error) => {
			sendResponse({
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			});
		});

	return true;
});

async function handleStartSync(taskId: string): Promise<{ ok: boolean; postUrl?: string }> {
	const settings = await loadSettings();
	if (!settings.token) {
		throw new Error('Extension token is not configured.');
	}

	const task = await getTask(settings, taskId);

	try {
		const draft = await saveDraftToCsdn(task);
		await postTaskResult(settings, taskId, {
			status: 'success',
			postId: draft.postId,
			postUrl: draft.postUrl,
		});
		return { ok: true, postUrl: draft.postUrl };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await postTaskResult(settings, taskId, {
			status: 'error',
			error: message,
		});
		throw error;
	}
}
