const taskId = new URL(window.location.href).searchParams.get('taskId');

if (window.location.pathname === '/trigger' && taskId) {
	setStatus('Sending task to CSDN Sync extension...');
	chrome.runtime.sendMessage(
		{ type: 'START_CSDN_SYNC', taskId },
		(response?: {
			ok?: boolean;
			postUrl?: string;
			windowName?: string;
			error?: string;
		}) => {
			if (chrome.runtime.lastError) {
				setStatus(chrome.runtime.lastError.message || 'Extension request failed.');
				return;
			}

			if (response?.ok && response.postUrl) {
				window.name = response.windowName || `csdn-sync:${taskId}`;
				setStatus(`Opening CSDN editor: ${response.postUrl}`);
				window.location.assign(response.postUrl);
				return;
			}

			setStatus(response?.error || 'CSDN sync failed.');
		},
	);
}

function setStatus(message: string): void {
	const target = document.querySelector('[data-csdn-sync-task-id]');
	if (target) {
		target.textContent = message;
		return;
	}

	document.body.textContent = message;
}
