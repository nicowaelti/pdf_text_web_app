export interface ArtifactItem {
  id: string;
  content: string;
  is_locked: boolean;
}

export interface GeneratedArtifacts {
  userStories: ArtifactItem[];
  functionalRequirements: ArtifactItem[];
  nonFunctionalRequirements: ArtifactItem[];
  architectureSuggestions: ArtifactItem[];
  useCaseDiagram: string;
}

export type ArtifactTypeMapping = {
  'user_story': 'userStories';
  'func_req': 'functionalRequirements';
  'non_func_req': 'nonFunctionalRequirements';
  'arch_suggestion': 'architectureSuggestions';
};

export const artifactTypeMap: ArtifactTypeMapping = {
  'user_story': 'userStories',
  'func_req': 'functionalRequirements',
  'non_func_req': 'nonFunctionalRequirements',
  'arch_suggestion': 'architectureSuggestions'
} as const;

export const reverseArtifactTypeMap: { [K in keyof GeneratedArtifacts]: string } = {
  userStories: 'user_story',
  functionalRequirements: 'func_req',
  nonFunctionalRequirements: 'non_func_req',
  architectureSuggestions: 'arch_suggestion',
  useCaseDiagram: 'use_case_diagram'
} as const;