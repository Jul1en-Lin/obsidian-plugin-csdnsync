import { marked } from 'marked';

export function markdownToHtml(markdown: string): string {
	try {
		const html = marked.parse(markdown, { async: false });
		if (typeof html === 'string') {
			return html;
		}
	} catch {
		return fallbackHtml(markdown);
	}

	return fallbackHtml(markdown);
}

function fallbackHtml(markdown: string): string {
	return markdown
		.split(/\r?\n/)
		.map((line) => `<p>${escapeHtml(line)}</p>`)
		.join('');
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
