export interface SyncTask {
	id: string;
	title: string;
	markdown: string;
	images?: SyncImageAsset[];
	sourcePath: string;
	createdAt: string;
}

export interface SyncImageAsset {
	id: string;
	placeholderSrc: string;
	originalSrc: string;
	sourcePath: string;
	filename: string;
	mimeType: string;
	dataBase64: string;
}

export type SyncTaskResult =
	| {
			status: 'success';
			postId?: string;
			postUrl: string;
	  }
	| {
			status: 'manual-fill';
			postUrl: string;
	  }
	| {
			status: 'error';
			error: string;
	  };
