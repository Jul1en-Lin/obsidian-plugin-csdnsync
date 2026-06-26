import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CSDN_API_SECRET, createSignedHeaders, getSignString } from './sign';

describe('CSDN signing', () => {
	it('builds the GET sign string expected by CSDN', () => {
		expect(getSignString('/path', 'GET', 'nonce')).toBe(
			'GET\n*/*\n\n\n\nx-ca-key:203803574\nx-ca-nonce:nonce\n/path',
		);
	});

	it('creates a base64 HMAC-SHA256 signature', async () => {
		const headers = await createSignedHeaders('/path', 'POST', 'nonce');
		const expected = createHmac('sha256', CSDN_API_SECRET)
			.update(getSignString('/path', 'POST', 'nonce'))
			.digest('base64');

		expect(headers['x-ca-signature']).toBe(expected);
		expect(headers['content-type']).toBe('application/json');
	});
});
