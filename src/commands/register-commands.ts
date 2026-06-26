import { Notice } from 'obsidian';
import type CsdnSyncPlugin from '../main';

export function registerCommands(plugin: CsdnSyncPlugin): void {
	plugin.addCommand({
		id: 'sync-current-note-to-csdn-draft',
		name: 'Sync current note to draft',
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
