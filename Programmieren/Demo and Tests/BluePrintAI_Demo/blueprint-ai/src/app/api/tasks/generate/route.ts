import { NextResponse } from 'next/server';
import { generateTasks } from '@/lib/openai-client';
import { createTasks } from '@/lib/task-service';

export async function POST(request: Request) {
  try {
    const { projectId, artifactId, description } = await request.json();

    if (!projectId || !artifactId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate tasks
    const tasks = await generateTasks(projectId, artifactId, description);
    
    // Create tasks in database
    await createTasks(tasks);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error generating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}
