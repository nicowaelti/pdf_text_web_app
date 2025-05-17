// /src/types/thesis.ts

export interface ExtensionSuggestion {
  id: string; // Add a unique ID for React key and state updates
  text: string;
  citation: string;
  relevance?: number;
  choosen: boolean; // Will be actively managed
  keep: boolean;    // Will be actively managed
  "Main Statement"?: string;
}

export interface Paragraph {
  paragraph_id: string;
  text: string;
  citations: string[];
  extension_suggestions?: ExtensionSuggestion[];
}

export interface Section {
  section_id: string;
  subtitle: string;
  paragraphs: Paragraph[];
}

export interface ThesisChapter {
  sub_chapter_id: string;
  title: string;
  sections: Section[];
}

export interface ResolvedCitation {
  citation_id: string;
  author: string;
  year: number | null;
  title: string;
  journal: string;
  doi: string;
}

export interface Bibliography {
  resolved_citations: ResolvedCitation[];
  // We can add unresolved_citations here if needed later
}