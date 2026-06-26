import type { SyncTask } from '../types';

export interface CsdnDraftPayload {
	title: string;
	markdowncontent: string;
	content: string;
	readType: 'public';
	level: 0;
	tags: string;
	status: 2;
	categories: string;
	type: 'original';
	original_link: string;
	authorized_status: false;
	not_auto_saved: '1';
	source: 'pc_mdeditor';
	cover_images: string[];
	cover_type: 1;
	is_new: 1;
	vote_id: 0;
	resource_id: string;
	pubStatus: 'draft';
	creator_activity_id: string;
}

export function createDraftPayload(
	task: SyncTask,
	html: string,
): CsdnDraftPayload {
	return {
		title: task.title,
		markdowncontent: task.markdown,
		content: html,
		readType: 'public',
		level: 0,
		tags: '',
		status: 2,
		categories: '',
		type: 'original',
		original_link: '',
		authorized_status: false,
		not_auto_saved: '1',
		source: 'pc_mdeditor',
		cover_images: [],
		cover_type: 1,
		is_new: 1,
		vote_id: 0,
		resource_id: '',
		pubStatus: 'draft',
		creator_activity_id: '',
	};
}
