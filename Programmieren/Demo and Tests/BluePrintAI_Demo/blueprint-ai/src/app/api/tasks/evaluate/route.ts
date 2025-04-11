import { NextResponse } from 'next/server';
import { evaluateTasks } from '@/lib/openai-client';
import { ArtifactType } from '@/types/artifact-db';

export async function POST(request: Request) {
  try {
    const { projectId, artifactType, content } = await request.json();

    if (!projectId || !artifactType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate artifactType
    if (!isValidArtifactType(artifactType)) {
      return NextResponse.json(
        { error: 'Invalid artifact type' },
        { status: 400 }
      );
    }

    // Evaluate task impact
    const evaluation = await evaluateTasks(
      projectId,
      artifactType as ArtifactType,
      content
    );

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error evaluating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate tasks' },
      { status: 500 }
    );
  }
}

function isValidArtifactType(type: string): type is ArtifactType {
  return ['user_story', 'func_req', 'non_func_req', 'arch_suggestion', 'use_case_diagram'].includes(type);
}
