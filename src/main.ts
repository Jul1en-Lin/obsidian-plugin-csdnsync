import { Notice, Plugin } from 'obsidian';
import { registerCommands } from './commands/register-commands';
import { extractActiveNote } from './obsidian/note-extractor';
import { LocalServer } from './server/local-server';
import { createTaskStore, type TaskStore } from './server/task-store';
import {
	CsdnSyncSettingTab,
	normalizeSettings,
} from './settings';
import type { CsdnSyncSettings, SyncTask, SyncTaskResult } from './types';

export default class CsdnSyncPlugin extends Plugin {
	settings!: CsdnSyncSettings;
	private localServer: LocalServer | null = null;
	private taskStore!: TaskStore;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.taskStore = createTaskStore();

		this.addRibbonIcon('upload-cloud', 'Sync current note to csdn draft', () => {
			void this.startSyncCurrentNote();
		});
		registerCommands(this);
		this.addSettingTab(new CsdnSyncSettingTab(this.app, this));

		await this.restartLocalServer();
	}

	onunload(): void {
		void this.localServer?.stop();
		this.localServer = null;
	}

	async loadSettings(): Promise<void> {
		this.settings = normalizeSettings(
			(await this.loadData()) as Partial<CsdnSyncSettings> | null,
		);
		await this.saveSettings();
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async restartLocalServer(): Promise<void> {
		await this.localServer?.stop();
		this.localServer = null;

		if (!this.settings.serverEnabled) {
			return;
		}

		this.localServer = new LocalServer({
			getToken: () => this.settings.token,
			taskStore: this.taskStore,
			onResult: (_taskId, result) => this.showResult(result),
		});

		try {
			await this.localServer.start(this.settings.port);
		} catch (error) {
			this.localServer = null;
			new Notice(
				`CSDN Sync server failed on port ${this.settings.port}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	async createSyncTask(): Promise<SyncTask> {
		const input = await extractActiveNote(this.app);
		return this.taskStore.create(input);
	}

	async startSyncCurrentNote(): Promise<void> {
		try {
			const task = await this.createSyncTask();
			const url = this.getTriggerUrl(task.id);
			window.open(url, '_blank');
			new Notice('Draft sync task created. Continue in chrome.');
		} catch (error) {
			new Notice(error instanceof Error ? error.message : String(error));
		}
	}

	getTriggerUrl(taskId: string): string {
		return `http://127.0.0.1:${this.settings.port}/trigger?taskId=${encodeURIComponent(
			taskId,
		)}`;
	}

	private showResult(result: SyncTaskResult): void {
		if (result.status === 'success') {
			new Notice(`CSDN draft saved: ${result.postUrl}`, 10000);
			return;
		}

		new Notice(`CSDN sync failed: ${result.error}`, 10000);
	}
}
