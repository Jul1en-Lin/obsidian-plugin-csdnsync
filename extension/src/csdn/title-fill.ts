export interface TitleDisplayLike {
	textContent: string | null;
	setAttribute(name: string, value: string): void;
}

export function hideTitleDisplayWhileInputIsActive(
	titleDisplay: TitleDisplayLike | null | undefined,
): void {
	if (!titleDisplay) {
		return;
	}

	titleDisplay.textContent = '';
	titleDisplay.setAttribute('aria-hidden', 'true');
}
