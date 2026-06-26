export const CSDN_API_KEY = '203803574';
export const CSDN_API_SECRET = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba';

export type CsdnMethod = 'GET' | 'POST';

export function createNonce(): string {
	return crypto.randomUUID();
}

export function getSignString(
	apiPath: string,
	method: CsdnMethod,
	nonce: string,
): string {
	if (method === 'GET') {
		return `GET\n*/*\n\n\n\nx-ca-key:${CSDN_API_KEY}\nx-ca-nonce:${nonce}\n${apiPath}`;
	}

	return `POST\n*/*\n\napplication/json\n\nx-ca-key:${CSDN_API_KEY}\nx-ca-nonce:${nonce}\n${apiPath}`;
}

export async function createSignedHeaders(
	apiPath: string,
	method: CsdnMethod,
	nonce = createNonce(),
): Promise<Record<string, string>> {
	const signature = await hmacSha256Base64(
		getSignString(apiPath, method, nonce),
		CSDN_API_SECRET,
	);

	const headers: Record<string, string> = {
		accept: '*/*',
		'x-ca-key': CSDN_API_KEY,
		'x-ca-nonce': nonce,
		'x-ca-signature': signature,
		'x-ca-signature-headers': 'x-ca-key,x-ca-nonce',
	};

	if (method === 'POST') {
		headers['content-type'] = 'application/json';
	}

	return headers;
}

async function hmacSha256Base64(message: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const signature = await crypto.subtle.sign(
		'HMAC',
		cryptoKey,
		encoder.encode(message),
	);

	let binary = '';
	for (const byte of new Uint8Array(signature)) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}
