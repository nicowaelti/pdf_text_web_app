import { NextResponse } from 'next/server';
import { updateTask } from '@/lib/task-service';
import { TaskStatus } from '@/types/task';

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { status } = await request.json() as { status: TaskStatus };

    if (!status || !['open', 'in_progress', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTask(params.taskId, { status });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
