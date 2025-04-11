import { GeneratedArtifacts } from './artifacts';

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface GenerateResponse {
  project: Project;
  artifacts: GeneratedArtifacts;
}