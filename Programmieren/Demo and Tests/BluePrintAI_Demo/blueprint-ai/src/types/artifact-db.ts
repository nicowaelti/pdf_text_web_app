export type ArtifactType = 'user_story' | 'func_req' | 'non_func_req' | 'arch_suggestion' | 'use_case_diagram';

export interface ArtifactRecord {
  id: string;
  project_id: string;
  type: ArtifactType;
  content: string | null;
  is_locked: boolean;
  generated_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RegenerateResponse {
  artifacts: {
    id: string;
    content: string;
    is_locked: boolean;
  }[];
  taskEvaluation?: {
    needsUpdate: boolean;
    reason?: string;
  };
}
