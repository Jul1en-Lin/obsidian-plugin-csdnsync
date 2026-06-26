export interface ExtensionSettings {
	obsidianBaseUrl: string;
	token: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
	obsidianBaseUrl: 'http://127.0.0.1:27187',
	token: '',
};

export async function loadSettings(): Promise<ExtensionSettings> {
	const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
	return {
		obsidianBaseUrl: String(stored.obsidianBaseUrl || DEFAULT_SETTINGS.obsidianBaseUrl),
		token: String(stored.token || ''),
	};
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
	await chrome.storage.local.set(settings);
}
