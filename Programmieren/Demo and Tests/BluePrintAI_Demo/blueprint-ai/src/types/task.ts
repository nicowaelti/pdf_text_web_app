import { Database } from '@/lib/database.types';

export type TaskStatus = 'open' | 'in_progress' | 'done';

export interface TaskCreate {
  project_id: string;
  artifact_id: string;
  title: string;
  description: string | null;
  order_index: number;
  status?: TaskStatus;
}

export interface TaskUpdate {
  status?: TaskStatus;
  order_index?: number;
}

export interface TaskResponse {
  id: string;
  project_id: string;
  artifact_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStack {
  open: TaskResponse[];
  in_progress: TaskResponse[];
  done: TaskResponse[];
}

export type TaskRecord = Database['public']['Tables']['tasks']['Row'];

export interface TaskEvaluation {
  needsUpdate: boolean;
  reason?: string;
}

export interface TaskReorder {
  id: string;
  order_index: number;
  project_id: string;
  status: TaskStatus;
}
