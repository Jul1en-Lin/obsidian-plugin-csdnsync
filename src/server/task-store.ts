import type { SyncTask, SyncTaskInput, SyncTaskResult } from '../types';

export interface TaskStore {
	create(input: SyncTaskInput): SyncTask;
	get(id: string): SyncTask | null;
	recordResult(id: string, result: SyncTaskResult): SyncTask | null;
	all(): SyncTask[];
}

export function createTaskStore(
	createId: () => string = () =>
		`sync_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
): TaskStore {
	const tasks = new Map<string, SyncTask>();

	return {
		create(input) {
			const task: SyncTask = {
				...input,
				id: createId(),
				status: 'pending',
				createdAt: new Date().toISOString(),
			};
			tasks.set(task.id, task);
			return task;
		},

		get(id) {
			return tasks.get(id) ?? null;
		},

		recordResult(id, result) {
			const task = tasks.get(id);
			if (!task) {
				return null;
			}

			task.status = result.status;
			task.result = result;
			return task;
		},

		all() {
			return Array.from(tasks.values());
		},
	};
}
