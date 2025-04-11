import { createClient } from '@supabase/supabase-js';
import { TaskCreate, TaskUpdate, TaskResponse, TaskStatus } from '@/types/task';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

const supabaseServer = createClient<Database>(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function getProjectTasks(projectId: string) {
  if (!projectId) {
    return {
      open: [],
      in_progress: [],
      done: []
    };
  }

  try {
    const { data: openTasks } = await supabaseServer
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'open')
      .order('order_index');

    const { data: inProgressTasks } = await supabaseServer
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'in_progress')
      .order('order_index');

    const { data: doneTasks } = await supabaseServer
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'done')
      .order('order_index');

    return {
      open: openTasks ?? [],
      in_progress: inProgressTasks ?? [],
      done: doneTasks ?? []
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return {
      open: [],
      in_progress: [],
      done: []
    };
  }
}

export async function getNextTask(projectId: string): Promise<TaskResponse | null> {
  if (!projectId) return null;

  try {
    const { data: tasks } = await supabaseServer
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'open')
      .order('order_index')
      .limit(1);

    return tasks?.[0] ?? null;
  } catch (error) {
    console.error('Error fetching next task:', error);
    return null;
  }
}

export async function createTasks(tasks: TaskCreate[]) {
  if (!tasks.length) return;

  const now = new Date().toISOString();
  const tasksWithTimestamps = tasks.map(task => ({
    ...task,
    created_at: now,
    updated_at: now
  }));

  const { data, error } = await supabaseServer
    .from('tasks')
    .insert(tasksWithTimestamps)
    .select();

  if (error) {
    console.error('Error creating tasks:', error);
    throw new Error(`Failed to create tasks: ${error.message}`);
  }

  return data;
}

export async function updateTask(taskId: string, data: TaskUpdate) {
  if (!taskId) return;

  const { error } = await supabaseServer
    .from('tasks')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!taskId) return;
  await updateTask(taskId, { status });
}

export async function reorderTasks(
  projectId: string,
  status: TaskStatus,
  orderedTaskIds: string[]
) {
  if (!projectId || !orderedTaskIds.length) return;

  try {
    // First get the existing tasks to preserve required fields
    const { data: existingTasks } = await supabaseServer
      .from('tasks')
      .select('*')
      .in('id', orderedTaskIds);

    if (!existingTasks?.length) {
      return;
    }

    const now = new Date().toISOString();

    // Create updates with new order indices
    const updates = existingTasks.map((task, index) => ({
      ...task,
      order_index: index,
      status,
      updated_at: now
    }));

    const { error } = await supabaseServer
      .from('tasks')
      .upsert(updates);

    if (error) {
      throw new Error(`Failed to reorder tasks: ${error.message}`);
    }
  } catch (error) {
    console.error('Error reordering tasks:', error);
  }
}
