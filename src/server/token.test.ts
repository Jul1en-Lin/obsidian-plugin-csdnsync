import { describe, expect, it } from 'vitest';
import { createToken, isValidToken } from './token';

describe('token helpers', () => {
	it('creates a non-empty token', () => {
		expect(createToken()).toMatch(/^csdnsync_/);
	});

	it('accepts the exact expected token', () => {
		expect(isValidToken('secret', 'secret')).toBe(true);
	});

	it('rejects missing or mismatched tokens', () => {
		expect(isValidToken(undefined, 'secret')).toBe(false);
		expect(isValidToken('wrong', 'secret')).toBe(false);
	});
});
