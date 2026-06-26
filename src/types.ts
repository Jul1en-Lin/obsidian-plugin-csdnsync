export interface SyncTaskInput {
	title: string;
	markdown: string;
	sourcePath: string;
}

export interface SyncTask extends SyncTaskInput {
	id: string;
	status: SyncTaskStatus;
	createdAt: string;
	result?: SyncTaskResult;
}

export type SyncTaskStatus = 'pending' | 'success' | 'manual-fill' | 'error';

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

export interface CsdnSyncSettings {
	port: number;
	token: string;
	serverEnabled: boolean;
}
