import OpenAI from 'openai';
import { TaskCreate, TaskEvaluation } from '@/types/task';
import { GeneratedArtifacts } from '@/types/artifacts';
import { ArtifactType } from '@/types/artifact-db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

export async function generateArtifacts(
  description: string
): Promise<GeneratedArtifacts> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a software requirements expert. Generate requirements in JSON format with this exact structure:
{
  "userStories": [{"content": "string"}],
  "functionalRequirements": [{"content": "string"}],
  "nonFunctionalRequirements": [{"content": "string"}],
  "architectureSuggestions": [{"content": "string"}],
  "useCaseDiagram": "string"
}

Respond ONLY with the JSON, no other text.`
      },
      {
        role: 'user',
        content: `Generate software requirements for: ${description}`
      }
    ]
  });

  // Parse and structure the response
  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('Failed to generate artifacts: Empty response');
  }

  const parsed = JSON.parse(result);
  return {
    userStories: parsed.userStories,
    functionalRequirements: parsed.functionalRequirements,
    nonFunctionalRequirements: parsed.nonFunctionalRequirements,
    architectureSuggestions: parsed.architectureSuggestions,
    useCaseDiagram: parsed.useCaseDiagram
  };
}

export async function generateTasks(
  projectId: string,
  artifactId: string,
  description: string
): Promise<TaskCreate[]> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are generating project tasks based on requirements. Generate 5-10 specific implementation tasks. Each task should have a short title and detailed description. Respond with an array of tasks in this exact format:
[
  {
    "title": "Short task title",
    "description": "Detailed task description explaining what needs to be done"
  }
]

Respond ONLY with the JSON array, no other text.`
      },
      {
        role: 'user',
        content: `Generate implementation tasks for: ${description}`
      }
    ]
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('Failed to generate tasks: Empty response');
  }

  try {
    const tasks = JSON.parse(result);
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid response format: expected an array of tasks');
    }

    return tasks.map((task: { title: string; description: string }, index: number) => ({
      project_id: projectId,
      artifact_id: artifactId,
      title: task.title || 'Untitled Task',
      description: task.description || null,
      order_index: index,
      status: 'open'
    }));
  } catch (error) {
    console.error('Error parsing tasks:', error);
    throw new Error('Failed to parse tasks response');
  }
}

export async function evaluateTasks(
  projectId: string,
  artifactType: ArtifactType,
  content?: string
): Promise<TaskEvaluation> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are evaluating the impact of requirement changes on project tasks. Respond with JSON in this exact format:
{
  "needsUpdate": boolean,
  "reason": "string"
}

Respond ONLY with the JSON, no other text.`
      },
      {
        role: 'user',
        content: `Evaluate if these changes to ${artifactType} require task updates: ${content || 'No content changes'}`
      }
    ]
  });

  const result = response.choices[0].message.content;
  if (!result) {
    return { needsUpdate: false };
  }

  const evaluation = JSON.parse(result);
  return {
    needsUpdate: evaluation.needsUpdate,
    reason: evaluation.reason
  };
}

export async function regenerateArtifact(
  artifactType: ArtifactType,
  description: string,
  existingArtifacts: GeneratedArtifacts
): Promise<GeneratedArtifacts> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are regenerating specific software requirements while maintaining consistency. Respond with JSON in this exact format:
{
  "userStories": [{"content": "string"}],
  "functionalRequirements": [{"content": "string"}],
  "nonFunctionalRequirements": [{"content": "string"}],
  "architectureSuggestions": [{"content": "string"}],
  "useCaseDiagram": "string"
}

Respond ONLY with the JSON, no other text.`
      },
      {
        role: 'user',
        content: `Regenerate ${artifactType} for: ${description}\nExisting artifacts: ${JSON.stringify(existingArtifacts)}`
      }
    ]
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('Failed to regenerate artifact: Empty response');
  }
  return JSON.parse(result);
}
