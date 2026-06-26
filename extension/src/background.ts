import { getTask, postTaskResult } from './obsidian-api';
import { loadSettings } from './settings';
import {
	createCsdnEditorUrl,
	createCsdnEditorWindowName,
} from './csdn/editor-url';
import {
	deletePendingEditorTask,
	getPendingEditorTask,
	savePendingEditorTask,
} from './editor-task-store';

interface StartSyncMessage {
	type: 'START_CSDN_SYNC';
	taskId: string;
}

interface GetPendingEditorTaskMessage {
	type: 'GET_PENDING_EDITOR_TASK';
	taskId: string;
}

interface ClearPendingEditorTaskMessage {
	type: 'CLEAR_PENDING_EDITOR_TASK';
	taskId: string;
}

type CsdnSyncMessage =
	| StartSyncMessage
	| GetPendingEditorTaskMessage
	| ClearPendingEditorTaskMessage;

chrome.runtime.onMessage.addListener((message: CsdnSyncMessage, _sender, sendResponse) => {
	handleMessage(message)
		.then((result) => sendResponse(result))
		.catch((error) => {
			sendResponse({
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			});
		});

	return true;
});

async function handleMessage(message: CsdnSyncMessage): Promise<unknown> {
	if (message?.type === 'START_CSDN_SYNC') {
		return handleStartSync(message.taskId);
	}

	if (message?.type === 'GET_PENDING_EDITOR_TASK') {
		return {
			ok: true,
			task: await getPendingEditorTask(message.taskId),
		};
	}

	if (message?.type === 'CLEAR_PENDING_EDITOR_TASK') {
		await deletePendingEditorTask(message.taskId);
		return { ok: true };
	}

	return { ok: false, error: 'Unknown CSDN Sync message.' };
}

async function handleStartSync(
	taskId: string,
): Promise<{
	ok: boolean;
	postUrl?: string;
	windowName?: string;
	mode?: 'manual-fill';
}> {
	const settings = await loadSettings();
	if (!settings.token) {
		throw new Error('Extension token is not configured.');
	}

	const task = await getTask(settings, taskId);
	const editorUrl = createCsdnEditorUrl(task.id);
	const windowName = createCsdnEditorWindowName(task.id);

	await savePendingEditorTask(task);
	await postTaskResult(settings, taskId, {
		status: 'manual-fill',
		postUrl: editorUrl,
	});

	return { ok: true, mode: 'manual-fill', postUrl: editorUrl, windowName };
}
