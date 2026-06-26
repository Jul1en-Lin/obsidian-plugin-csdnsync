import { describe, expect, it } from 'vitest';
import { hideTitleDisplayWhileInputIsActive } from './title-fill';

describe('CSDN title fill helpers', () => {
	it('clears the display title while the input title is active', () => {
		const attributes = new Map<string, string>();
		const display = {
			textContent: '开发Tips',
			setAttribute: (name: string, value: string) => {
				attributes.set(name, value);
			},
		};

		hideTitleDisplayWhileInputIsActive(display);

		expect(display.textContent).toBe('');
		expect(attributes.get('aria-hidden')).toBe('true');
	});
});
