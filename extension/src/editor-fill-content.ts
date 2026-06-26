import type { SyncTask } from './types';
import { hideTitleDisplayWhileInputIsActive } from './csdn/title-fill';
import { uploadAndReplaceTaskImages } from './csdn/image-markdown';
import { uploadCsdnImage } from './csdn/image-upload';

const TASK_QUERY_PARAM = 'csdnSyncTaskId';
const WINDOW_NAME_PREFIX = 'csdn-sync:';
const STYLE_ELEMENT_ID = 'csdn-sync-editor-fill-style';
const TITLE_INPUT_VISIBLE_CLASS = 'csdn-sync-title-input-visible';
const BANNER_CLASS = 'csdn-sync-banner';
const taskId = readEditorTaskId(window.location.href, window.name);

if (window.location.hostname === 'editor.csdn.net' && taskId) {
	void fillFromPendingTask(taskId);
}

async function fillFromPendingTask(taskId: string): Promise<void> {
	try {
		const response = await sendRuntimeMessage<{
			ok?: boolean;
			task?: SyncTask | null;
			error?: string;
		}>({
			type: 'GET_PENDING_EDITOR_TASK',
			taskId,
		});

		if (!response?.ok || !response.task) {
			showBanner(response?.error || 'CSDN Sync task not found.', 'error');
			return;
		}

		await waitForEditor();
		const imageResult = await uploadAndReplaceTaskImages(
			response.task.markdown,
			response.task.images,
			uploadCsdnImage,
		);
		fillTitle(response.task.title);
		fillMarkdown(imageResult.markdown);
		await sendRuntimeMessage({ type: 'CLEAR_PENDING_EDITOR_TASK', taskId });
		showBanner(createSuccessMessage(imageResult), 'success');
	} catch (error) {
		showBanner(error instanceof Error ? error.message : String(error), 'error');
	}
}

async function waitForEditor(): Promise<void> {
	await waitForElement('.article-bar__input-box');
	await waitForElement('.editor__inner[contenteditable="true"]');
}

function fillTitle(title: string): void {
	const titleBox = document.querySelector<HTMLElement>('.article-bar__input-box');
	const titleDisplay = titleBox?.querySelector<HTMLElement>(
		'.article-bar__title-display',
	);
	const titleInput = titleBox?.querySelector<HTMLInputElement>(
		'input.article-bar__title',
	);

	titleDisplay?.click();

	if (titleInput) {
		ensureCsdnSyncStyles();
		titleInput.removeAttribute('aria-hidden');
		titleInput.classList.add(TITLE_INPUT_VISIBLE_CLASS);
		titleInput.focus();
		setNativeInputValue(titleInput, title);
		dispatchInputEvents(titleInput);
		titleInput.blur();
		hideTitleDisplayWhileInputIsActive(titleDisplay);
		return;
	}

	if (titleDisplay) {
		titleDisplay.textContent = title;
		dispatchInputEvents(titleDisplay);
	}
}

function fillMarkdown(markdown: string): void {
	const editor = document.querySelector<HTMLElement>(
		'.editor__inner[contenteditable="true"]',
	);
	if (!editor) {
		throw new Error('CSDN Markdown editor not found.');
	}

	editor.focus();
	clearMarkdown(editor);

	if (dispatchMarkdownPaste(editor, markdown)) {
		return;
	}

	if (!document.execCommand('insertText', false, markdown)) {
		editor.textContent = markdown;
		dispatchInputEvents(editor);
	}

	dispatchInputEvents(editor);
}

function readEditorTaskId(url: string, windowName: string): string | null {
	return (
		new URL(url).searchParams.get(TASK_QUERY_PARAM) ||
		readTaskIdFromWindowName(windowName)
	);
}

function readTaskIdFromWindowName(windowName: string): string | null {
	if (!windowName.startsWith(WINDOW_NAME_PREFIX)) {
		return null;
	}

	return windowName.slice(WINDOW_NAME_PREFIX.length) || null;
}

function clearMarkdown(editor: HTMLElement): void {
	editor.focus();
	selectElementContents(editor);
	document.execCommand('delete', false);

	if (editor.textContent?.trim()) {
		document.execCommand('selectAll', false);
		document.execCommand('delete', false);
	}

	if (editor.textContent?.trim()) {
		editor.textContent = '';
	}

	dispatchInputEvents(editor);
	editor.focus();
	selectElementContents(editor);
}

async function waitForElement(selector: string): Promise<Element> {
	const existing = document.querySelector(selector);
	if (existing) {
		return existing;
	}

	return new Promise((resolve, reject) => {
		const timeout = window.setTimeout(() => {
			observer.disconnect();
			reject(new Error(`Timed out waiting for ${selector}.`));
		}, 15000);

		const observer = new MutationObserver(() => {
			const element = document.querySelector(selector);
			if (!element) {
				return;
			}
			window.clearTimeout(timeout);
			observer.disconnect();
			resolve(element);
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	});
}

function selectElementContents(element: HTMLElement): void {
	const range = document.createRange();
	range.selectNodeContents(element);
	const selection = window.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);
}

function dispatchMarkdownPaste(element: HTMLElement, markdown: string): boolean {
	if (typeof DataTransfer === 'undefined' || typeof ClipboardEvent === 'undefined') {
		return false;
	}

	const clipboardData = new DataTransfer();
	clipboardData.setData('text/plain', markdown);

	const event = new ClipboardEvent('paste', {
		bubbles: true,
		cancelable: true,
		clipboardData,
	});

	element.dispatchEvent(event);
	return event.defaultPrevented;
}

function setNativeInputValue(input: HTMLInputElement, value: string): void {
	const prototype = Object.getPrototypeOf(input) as HTMLInputElement;
	const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
	descriptor?.set?.call(input, value);
}

function dispatchInputEvents(element: HTMLElement): void {
	element.dispatchEvent(new InputEvent('input', { bubbles: true }));
	element.dispatchEvent(new Event('change', { bubbles: true }));
}

function createSuccessMessage(imageResult: {
	uploaded: number;
	failed: number;
}): string {
	const parts = ['CSDN Sync filled this page. Save the draft manually.'];
	if (imageResult.uploaded > 0) {
		parts.push(`Uploaded ${imageResult.uploaded} image(s).`);
	}
	if (imageResult.failed > 0) {
		parts.push(`${imageResult.failed} image upload(s) failed.`);
	}
	return parts.join(' ');
}

function showBanner(message: string, type: 'success' | 'error'): void {
	ensureCsdnSyncStyles();
	const banner = document.createElement('div');
	banner.textContent = message;
	banner.className = `${BANNER_CLASS} ${BANNER_CLASS}--${type}`;
	document.body.appendChild(banner);
	window.setTimeout(() => banner.remove(), 8000);
}

function ensureCsdnSyncStyles(): void {
	if (document.getElementById(STYLE_ELEMENT_ID)) {
		return;
	}

	const styleElement = document.createElement('style');
	styleElement.id = STYLE_ELEMENT_ID;
	styleElement.textContent = `
.${TITLE_INPUT_VISIBLE_CLASS} {
	display: inline-block !important;
}

.${BANNER_CLASS} {
	position: fixed;
	top: 72px;
	right: 24px;
	z-index: 2147483647;
	max-width: 360px;
	padding: 10px 12px;
	border-radius: 6px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
	font-size: 13px;
	line-height: 1.4;
}

.${BANNER_CLASS}--success {
	color: #14532d;
	background: #dcfce7;
	border: 1px solid #86efac;
}

.${BANNER_CLASS}--error {
	color: #7f1d1d;
	background: #fee2e2;
	border: 1px solid #fecaca;
}
`;
	document.documentElement.appendChild(styleElement);
}

function sendRuntimeMessage<TResponse>(
	message: Record<string, unknown>,
): Promise<TResponse> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, (response: TResponse) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}
			resolve(response);
		});
	});
}
