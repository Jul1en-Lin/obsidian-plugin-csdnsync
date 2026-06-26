import type { SyncImageAsset } from '../types';

export interface ImageUploadSummary {
	markdown: string;
	uploaded: number;
	failed: number;
}

export function replaceImagePlaceholders(
	markdown: string,
	images: SyncImageAsset[],
	uploadedUrls: Map<string, string>,
): string {
	let result = markdown;

	for (const image of images) {
		const replacement = uploadedUrls.get(image.id) || image.originalSrc;
		result = result.split(image.placeholderSrc).join(replacement);
	}

	return result;
}

export async function uploadAndReplaceTaskImages(
	markdown: string,
	images: SyncImageAsset[] | undefined,
	uploadImage: (image: SyncImageAsset) => Promise<string>,
): Promise<ImageUploadSummary> {
	if (!images?.length) {
		return { markdown, uploaded: 0, failed: 0 };
	}

	const uploadedUrls = new Map<string, string>();
	let failed = 0;

	for (const image of images) {
		try {
			uploadedUrls.set(image.id, await uploadImage(image));
		} catch {
			failed++;
		}
	}

	return {
		markdown: replaceImagePlaceholders(markdown, images, uploadedUrls),
		uploaded: uploadedUrls.size,
		failed,
	};
}
