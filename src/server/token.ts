export function createToken(): string {
	const random =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${Date.now()}_${Math.random().toString(36).slice(2)}`;
	return `csdnsync_${random}`;
}

export function isValidToken(
	provided: string | undefined,
	expected: string,
): boolean {
	return Boolean(provided) && provided === expected;
}
