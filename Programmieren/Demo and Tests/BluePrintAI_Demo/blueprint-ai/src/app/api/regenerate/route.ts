import { NextResponse } from 'next/server';
import { regenerateArtifact, evaluateTasks } from '@/lib/openai-client';
import { ArtifactType } from '@/types/artifact-db';

export async function POST(request: Request) {
  try {
    const { projectId, description, section, existingArtifacts } = await request.json();

    if (!projectId || !description || !section || !existingArtifacts) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate section type
    if (!isValidArtifactType(section)) {
      return NextResponse.json(
        { error: 'Invalid artifact type' },
        { status: 400 }
      );
    }

    // Regenerate the artifacts
    const artifacts = await regenerateArtifact(
      section as ArtifactType,
      description,
      existingArtifacts
    );

    // Evaluate if tasks need to be updated
    const taskEvaluation = await evaluateTasks(
      projectId,
      section as ArtifactType,
      JSON.stringify(artifacts)
    );

    return NextResponse.json({ artifacts, taskEvaluation });
  } catch (error) {
    console.error('Error regenerating artifacts:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate artifacts' },
      { status: 500 }
    );
  }
}

function isValidArtifactType(type: string): type is ArtifactType {
  return ['user_story', 'func_req', 'non_func_req', 'arch_suggestion', 'use_case_diagram'].includes(type);
}
