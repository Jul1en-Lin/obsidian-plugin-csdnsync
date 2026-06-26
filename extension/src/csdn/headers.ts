const CSDN_HEADER_RULE_ID = 2718701;

export async function withCsdnHeaderRules<T>(fn: () => Promise<T>): Promise<T> {
	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [CSDN_HEADER_RULE_ID],
		addRules: [
			{
				id: CSDN_HEADER_RULE_ID,
				priority: 1,
				action: {
					type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
					requestHeaders: [
						{
							header: 'Origin',
							operation: chrome.declarativeNetRequest.HeaderOperation.SET,
							value: 'https://editor.csdn.net',
						},
						{
							header: 'Referer',
							operation: chrome.declarativeNetRequest.HeaderOperation.SET,
							value: 'https://editor.csdn.net/',
						},
					],
				},
				condition: {
					urlFilter: '||bizapi.csdn.net/',
					initiatorDomains: [chrome.runtime.id],
					resourceTypes: [
						chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
					],
				},
			},
		],
	});

	try {
		return await fn();
	} finally {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [CSDN_HEADER_RULE_ID],
		});
	}
}
