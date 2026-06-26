import { describe, expect, it } from 'vitest';
import {
	createCsdnEditorUrl,
	createCsdnEditorWindowName,
	readCsdnEditorTaskId,
	readCsdnSyncTaskId,
} from './editor-url';

describe('CSDN editor URL helpers', () => {
	it('round trips the sync task id through the editor URL', () => {
		const url = createCsdnEditorUrl('sync_1 with spaces');

		expect(url).toBe(
			'https://editor.csdn.net/md/?csdnSyncTaskId=sync_1+with+spaces',
		);
		expect(readCsdnSyncTaskId(url)).toBe('sync_1 with spaces');
	});

	it('uses a per-task editor window handle', () => {
		const windowName = createCsdnEditorWindowName('sync_2');

		expect(windowName).toBe('csdn-sync:sync_2');
		expect(readCsdnEditorTaskId('https://editor.csdn.net/md/', windowName)).toBe(
			'sync_2',
		);
		expect(
			readCsdnEditorTaskId(
				'https://editor.csdn.net/md/?csdnSyncTaskId=sync_3',
				windowName,
			),
		).toBe('sync_3');
	});
});
