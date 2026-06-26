export interface SyncTask {
	id: string;
	title: string;
	markdown: string;
	sourcePath: string;
	createdAt: string;
}

export type SyncTaskResult =
	| {
			status: 'success';
			postId?: string;
			postUrl: string;
	  }
	| {
			status: 'error';
			error: string;
	  };
