import { GeneratedArtifacts } from "@/types/artifacts";
import { Project } from "@/types/project";

export const artifactsToMarkdown = (project: Project, artifacts: GeneratedArtifacts): string => {
  const sections = [
    `# ${project.name}\n`,
    `${project.description}\n`,
    "\n## User Stories\n",
    ...artifacts.userStories.map(story => `* ${story.content}\n`),
    "\n## Functional Requirements\n",
    ...artifacts.functionalRequirements.map(req => `* ${req.content}\n`),
    "\n## Non-Functional Requirements\n",
    ...artifacts.nonFunctionalRequirements.map(req => `* ${req.content}\n`),
    "\n## Architecture Suggestions\n",
    ...artifacts.architectureSuggestions.map(sugg => `* ${sugg.content}\n`),
    "\n## Use Case Diagram\n",
    "```mermaid\n",
    artifacts.useCaseDiagram,
    "\n```"
  ];

  return sections.join("");
};

export const parseMarkdownToArtifacts = (markdown: string): { project: Project; artifacts: GeneratedArtifacts } => {
  const lines = markdown.split("\n");
  let currentSection: string | null = null;
  
  const project: Project = {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    created_at: new Date().toISOString()
  };
  
  const artifacts: GeneratedArtifacts = {
    userStories: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    architectureSuggestions: [],
    useCaseDiagram: ""
  };

  let collectingDiagram = false;
  const diagramLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith("# ")) {
      project.name = line.substring(2);
    } else if (line.startsWith("## ")) {
      currentSection = line.substring(3);
      collectingDiagram = false;
    } else if (line === "```mermaid") {
      collectingDiagram = true;
      continue;
    } else if (line === "```" && collectingDiagram) {
      artifacts.useCaseDiagram = diagramLines.join("\n");
      collectingDiagram = false;
      continue;
    } else if (collectingDiagram) {
      diagramLines.push(line);
    } else if (line.startsWith("* ")) {
      const content = line.substring(2);
      const item = { id: crypto.randomUUID(), content, is_locked: false };
      
      switch(currentSection) {
        case "User Stories":
          artifacts.userStories.push(item);
          break;
        case "Functional Requirements":
          artifacts.functionalRequirements.push(item);
          break;
        case "Non-Functional Requirements":
          artifacts.nonFunctionalRequirements.push(item);
          break;
        case "Architecture Suggestions":
          artifacts.architectureSuggestions.push(item);
          break;
      }
    } else if (!currentSection && line && !project.description) {
      project.description = line;
    }
  }

  return { project, artifacts };
};
