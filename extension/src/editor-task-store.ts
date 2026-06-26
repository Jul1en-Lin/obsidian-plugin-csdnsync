import type { SyncTask } from './types';

const STORAGE_KEY = 'csdnSyncPendingEditorTasks';

type PendingEditorTasks = Record<string, SyncTask>;

export async function savePendingEditorTask(task: SyncTask): Promise<void> {
	const tasks = await loadPendingEditorTasks();
	tasks[task.id] = task;
	await chrome.storage.local.set({ [STORAGE_KEY]: tasks });
}

export async function getPendingEditorTask(
	taskId: string,
): Promise<SyncTask | null> {
	const tasks = await loadPendingEditorTasks();
	return tasks[taskId] ?? null;
}

export async function deletePendingEditorTask(taskId: string): Promise<void> {
	const tasks = await loadPendingEditorTasks();
	delete tasks[taskId];
	await chrome.storage.local.set({ [STORAGE_KEY]: tasks });
}

async function loadPendingEditorTasks(): Promise<PendingEditorTasks> {
	const stored = await chrome.storage.local.get(STORAGE_KEY);
	const tasks = stored[STORAGE_KEY];
	return isRecord(tasks) ? (tasks as PendingEditorTasks) : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
