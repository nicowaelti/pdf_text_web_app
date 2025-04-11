import { supabase } from './supabase-client';
import { ArtifactType } from '@/types/artifact-db';
import { TaskEvaluation } from '@/types/task';

export interface RegenerateResult {
  artifacts: {
    id: string;
    content: string;
    is_locked: boolean;
  }[];
  taskEvaluation?: TaskEvaluation;
}

export interface ArtifactCreate {
  project_id: string;
  type: ArtifactType;
  content: string;
}

export async function createArtifact(data: ArtifactCreate): Promise<string> {
  const { data: artifact, error } = await supabase
    .from('artifacts')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create artifact: ${error.message}`);
  }

  return artifact.id;
}

export async function updateArtifact(projectId: string, artifactId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('artifacts')
    .update({ content })
    .eq('id', artifactId)
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to update artifact: ${error.message}`);
  }
}

export async function evaluateArtifactChanges(
  projectId: string,
  artifactType: ArtifactType,
  content: string
): Promise<TaskEvaluation> {
  const response = await fetch('/api/tasks/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, artifactType, content })
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate artifact changes');
  }

  return response.json();
}

export async function deleteArtifact(projectId: string, artifactId: string): Promise<void> {
  const { error } = await supabase
    .from('artifacts')
    .delete()
    .eq('id', artifactId)
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to delete artifact: ${error.message}`);
  }
}

export async function toggleLock(projectId: string, artifactId: string): Promise<void> {
  const { data: currentArtifact, error: fetchError } = await supabase
    .from('artifacts')
    .select('is_locked')
    .eq('id', artifactId)
    .eq('project_id', projectId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch artifact: ${fetchError.message}`);
  }

  const { error: updateError } = await supabase
    .from('artifacts')
    .update({ is_locked: !currentArtifact?.is_locked })
    .eq('id', artifactId)
    .eq('project_id', projectId);

  if (updateError) {
    throw new Error(`Failed to toggle lock: ${updateError.message}`);
  }
}

export async function regenerateSection(
  projectId: string,
  description: string,
  section: ArtifactType
): Promise<RegenerateResult> {
  const response = await fetch('/api/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, section, description })
  });

  if (!response.ok) {
    throw new Error('Failed to regenerate section');
  }

  return response.json();
}
