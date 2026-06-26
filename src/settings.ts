import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import CsdnSyncPlugin from './main';
import type { CsdnSyncSettings } from './types';
import { createToken } from './server/token';

export const DEFAULT_SETTINGS: CsdnSyncSettings = {
	port: 27187,
	token: '',
	serverEnabled: true,
};

export function normalizeSettings(
	data: Partial<CsdnSyncSettings> | null | undefined,
): CsdnSyncSettings {
	return {
		...DEFAULT_SETTINGS,
		...data,
		token: data?.token || createToken(),
	};
}

export class CsdnSyncSettingTab extends PluginSettingTab {
	plugin: CsdnSyncPlugin;

	constructor(app: App, plugin: CsdnSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Local server')
			.setDesc('Enable the localhost bridge used by the chrome extension.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.serverEnabled)
					.onChange(async (value) => {
						this.plugin.settings.serverEnabled = value;
						await this.plugin.saveSettings();
						await this.plugin.restartLocalServer();
					}),
			);

		new Setting(containerEl)
			.setName('Port')
			.setDesc('Local server port.')
			.addText((text) =>
				text
					.setPlaceholder('27187')
					.setValue(String(this.plugin.settings.port))
					.onChange(async (value) => {
						const port = Number(value);
						if (!Number.isInteger(port) || port < 1 || port > 65535) {
							return;
						}
						this.plugin.settings.port = port;
						await this.plugin.saveSettings();
						await this.plugin.restartLocalServer();
					}),
			);

		new Setting(containerEl)
			.setName('Extension token')
			.setDesc('Copy this token into the chrome extension.')
			.addText((text) =>
				{
					text.setValue(this.plugin.settings.token);
					text.inputEl.disabled = true;
					return text;
				},
			)
			.addButton((button) =>
				button.setButtonText('Copy').onClick(async () => {
					await navigator.clipboard.writeText(this.plugin.settings.token);
					new Notice('Extension token copied.');
				}),
			)
			.addButton((button) =>
				button.setButtonText('Regenerate').onClick(async () => {
					this.plugin.settings.token = createToken();
					await this.plugin.saveSettings();
					this.display();
				}),
			);

		new Setting(containerEl)
			.setName('Sync current note')
			.setDesc('Create a draft sync task for the active Markdown note.')
			.addButton((button) =>
				button.setButtonText('Sync').onClick(() => {
					void this.plugin.startSyncCurrentNote();
				}),
			);
	}
}
