import { checkHealth } from '../obsidian-api';
import { loadSettings, saveSettings } from '../settings';

const baseUrlInput = getInput('obsidianBaseUrl');
const tokenInput = getInput('token');
const statusEl = document.getElementById('status') as HTMLParagraphElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const checkButton = document.getElementById('check') as HTMLButtonElement;

loadSettings()
	.then((settings) => {
		baseUrlInput.value = settings.obsidianBaseUrl;
		tokenInput.value = settings.token;
	})
	.catch((error) => setStatus(error));

saveButton.addEventListener('click', async () => {
	await saveSettings({
		obsidianBaseUrl: baseUrlInput.value.trim(),
		token: tokenInput.value.trim(),
	});
	setStatus('Saved.');
});

checkButton.addEventListener('click', async () => {
	const settings = {
		obsidianBaseUrl: baseUrlInput.value.trim(),
		token: tokenInput.value.trim(),
	};
	const ok = await checkHealth(settings);
	setStatus(ok ? 'Connection ok.' : 'Connection failed.');
});

function getInput(id: string): HTMLInputElement {
	return document.getElementById(id) as HTMLInputElement;
}

function setStatus(value: unknown): void {
	statusEl.textContent = value instanceof Error ? value.message : String(value);
}
