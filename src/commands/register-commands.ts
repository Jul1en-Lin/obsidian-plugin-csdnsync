import { Notice } from 'obsidian';
import type CsdnSyncPlugin from '../main';

export function registerCommands(plugin: CsdnSyncPlugin): void {
	plugin.addCommand({
		id: 'sync-current-note-to-csdn-draft',
		name: 'Open current note in csdn editor',
		callback: () => {
			void plugin.startSyncCurrentNote();
		},
	});

	plugin.addCommand({
		id: 'copy-extension-token',
		name: 'Copy extension token',
		callback: async () => {
			await navigator.clipboard.writeText(plugin.settings.token);
			new Notice('Extension token copied.');
		},
	});
}
