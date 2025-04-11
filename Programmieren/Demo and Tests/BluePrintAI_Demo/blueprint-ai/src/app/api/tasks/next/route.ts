import { NextResponse } from 'next/server';
import { getNextTask } from '@/lib/task-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      );
    }

    const nextTask = await getNextTask(projectId);
    
    if (!nextTask) {
      return NextResponse.json(
        { message: 'No open tasks available' },
        { status: 404 }
      );
    }

    return NextResponse.json(nextTask);
  } catch (error) {
    console.error('Error fetching next task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next task' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
