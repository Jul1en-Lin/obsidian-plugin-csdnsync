import type { SyncImageAsset } from '../types';
import { createSignedHeaders } from './sign';

const CSDN_API_BASE = 'https://bizapi.csdn.net';
const IMAGE_SIGNATURE_PATH = '/resource-api/v1/image/direct/upload/signature';

interface UploadSignatureResponse {
	code?: number;
	msg?: string;
	message?: string;
	data?: {
		filePath: string;
		host: string;
		accessId: string;
		policy: string;
		signature: string;
		callbackUrl: string;
		callbackBody: string;
		callbackBodyType: string;
		customParam: {
			rtype: string;
			filePath: string;
			isAudit: number;
			'x-image-app': string;
			type: string;
			'x-image-suffix': string;
			username: string;
		};
	};
}

interface ObsUploadResponse {
	code?: number;
	msg?: string;
	message?: string;
	data?: {
		imageUrl?: string;
	};
}

export async function uploadCsdnImage(image: SyncImageAsset): Promise<string> {
	const imageSuffix = getImageSuffix(image.filename, image.mimeType);
	const headers = await createSignedHeaders(IMAGE_SIGNATURE_PATH, 'POST');
	const signatureResponse = await fetch(`${CSDN_API_BASE}${IMAGE_SIGNATURE_PATH}`, {
		method: 'POST',
		credentials: 'include',
		headers,
		body: JSON.stringify({
			imageTemplate: '',
			appName: 'direct_blog_markdown',
			imageSuffix,
		}),
	});

	const signature = (await signatureResponse.json()) as UploadSignatureResponse;
	if (signature.code !== 200 || !signature.data) {
		throw new Error(signature.msg || signature.message || 'CSDN image signature failed');
	}

	const upload = signature.data;
	const customParam = upload.customParam;
	const formData = new FormData();
	formData.append('key', upload.filePath);
	formData.append('policy', upload.policy);
	formData.append('signature', upload.signature);
	formData.append('callbackBody', upload.callbackBody);
	formData.append('callbackBodyType', upload.callbackBodyType);
	formData.append('callbackUrl', upload.callbackUrl);
	formData.append('AccessKeyId', upload.accessId);
	formData.append('x:rtype', customParam.rtype);
	formData.append('x:filePath', customParam.filePath);
	formData.append('x:isAudit', String(customParam.isAudit));
	formData.append('x:x-image-app', customParam['x-image-app']);
	formData.append('x:type', customParam.type);
	formData.append('x:x-image-suffix', customParam['x-image-suffix']);
	formData.append('x:username', customParam.username);
	formData.append('file', base64ToBlob(image.dataBase64, image.mimeType), image.filename);

	const obsResponse = await fetch(upload.host, {
		method: 'POST',
		body: formData,
	});
	const obs = (await obsResponse.json()) as ObsUploadResponse;
	if (obs.code !== 200 || !obs.data?.imageUrl) {
		throw new Error(obs.msg || obs.message || 'CSDN image upload failed');
	}

	return obs.data.imageUrl;
}

function getImageSuffix(filename: string, mimeType: string): string {
	const suffix = filename.split('.').pop()?.toLowerCase() || '';
	if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(suffix)) {
		return suffix;
	}

	if (mimeType === 'image/jpeg') {
		return 'jpg';
	}

	const mimeSuffix = mimeType.split('/')[1]?.toLowerCase() || '';
	return ['png', 'gif', 'webp'].includes(mimeSuffix) ? mimeSuffix : 'jpg';
}

function base64ToBlob(dataBase64: string, mimeType: string): Blob {
	const binary = atob(dataBase64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new Blob([bytes], { type: mimeType });
}
