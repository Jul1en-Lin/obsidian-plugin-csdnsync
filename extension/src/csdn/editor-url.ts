const CSDN_EDITOR_URL = 'https://editor.csdn.net/md/';
const TASK_QUERY_PARAM = 'csdnSyncTaskId';
const WINDOW_NAME_PREFIX = 'csdn-sync:';

export function createCsdnEditorUrl(taskId: string): string {
	const url = new URL(CSDN_EDITOR_URL);
	url.searchParams.set(TASK_QUERY_PARAM, taskId);
	return url.toString();
}

export function readCsdnSyncTaskId(url: string): string | null {
	return new URL(url).searchParams.get(TASK_QUERY_PARAM);
}

export function createCsdnEditorWindowName(taskId: string): string {
	return `${WINDOW_NAME_PREFIX}${taskId}`;
}

export function readCsdnEditorTaskId(
	url: string,
	windowName: string,
): string | null {
	return readCsdnSyncTaskId(url) || readTaskIdFromWindowName(windowName);
}

function readTaskIdFromWindowName(windowName: string): string | null {
	if (!windowName.startsWith(WINDOW_NAME_PREFIX)) {
		return null;
	}

	return windowName.slice(WINDOW_NAME_PREFIX.length) || null;
}
