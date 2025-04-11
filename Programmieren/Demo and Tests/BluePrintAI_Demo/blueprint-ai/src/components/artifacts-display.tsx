'use client';

import { useState, useEffect } from 'react';
import { GeneratedArtifacts } from '@/types/artifacts';
import { MarkdownActions } from './markdown-actions';
import { formatMarkdown } from '@/lib/markdown-utils';
import { EditDialog } from './edit-dialog';
import { ArtifactType } from '@/types/artifact-db';
import { LoadingSpinner } from './loading-spinner';

interface ArtifactsDisplayProps {
  projectId: string;
  artifacts: GeneratedArtifacts;
  onUpdate: (id: string, content: string) => Promise<void>;
  onToggleLock: (id: string) => Promise<void>;
  onRegenerate: (section: ArtifactType) => Promise<void>;
}

interface EditDialogState {
  isOpen: boolean;
  content: string;
  artifactId: string;
}

interface FormattedContent {
  [key: string]: string;
}

const getArtifactType = (artifactId: string, artifacts: GeneratedArtifacts): ArtifactType => {
  if (artifacts.userStories.some(a => a.id === artifactId)) return 'user_story';
  if (artifacts.functionalRequirements.some(a => a.id === artifactId)) return 'func_req';
  if (artifacts.nonFunctionalRequirements.some(a => a.id === artifactId)) return 'non_func_req';
  if (artifacts.architectureSuggestions.some(a => a.id === artifactId)) return 'arch_suggestion';
  return 'user_story';
};

export function ArtifactsDisplay({
  projectId,
  artifacts,
  onUpdate,
  onToggleLock,
  onRegenerate
}: ArtifactsDisplayProps) {
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    content: '',
    artifactId: ''
  });
  const [formattedContent, setFormattedContent] = useState<FormattedContent>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    console.log('ArtifactsDisplay received props:', { projectId, artifacts });
    
    const formatAllContent = async () => {
      // Format user stories
      for (const story of artifacts.userStories) {
        setIsLoading(prev => ({ ...prev, [story.id]: true }));
        try {
          const html = await formatMarkdown(story.content);
          console.log('Formatted user story:', { id: story.id, content: story.content, html });
          setFormattedContent(prev => ({ ...prev, [story.id]: html }));
        } catch (error) {
          console.error('Error formatting markdown:', error);
        }
        setIsLoading(prev => ({ ...prev, [story.id]: false }));
      }

      // Format functional requirements
      for (const req of artifacts.functionalRequirements) {
        setIsLoading(prev => ({ ...prev, [req.id]: true }));
        try {
          const html = await formatMarkdown(req.content);
          console.log('Formatted functional requirement:', { id: req.id, content: req.content, html });
          setFormattedContent(prev => ({ ...prev, [req.id]: html }));
        } catch (error) {
          console.error('Error formatting markdown:', error);
        }
        setIsLoading(prev => ({ ...prev, [req.id]: false }));
      }

      // Format non-functional requirements
      for (const req of artifacts.nonFunctionalRequirements) {
        setIsLoading(prev => ({ ...prev, [req.id]: true }));
        try {
          const html = await formatMarkdown(req.content);
          console.log('Formatted non-functional requirement:', { id: req.id, content: req.content, html });
          setFormattedContent(prev => ({ ...prev, [req.id]: html }));
        } catch (error) {
          console.error('Error formatting markdown:', error);
        }
        setIsLoading(prev => ({ ...prev, [req.id]: false }));
      }

      // Format architecture suggestions
      for (const suggestion of artifacts.architectureSuggestions) {
        setIsLoading(prev => ({ ...prev, [suggestion.id]: true }));
        try {
          const html = await formatMarkdown(suggestion.content);
          console.log('Formatted architecture suggestion:', { id: suggestion.id, content: suggestion.content, html });
          setFormattedContent(prev => ({ ...prev, [suggestion.id]: html }));
        } catch (error) {
          console.error('Error formatting markdown:', error);
        }
        setIsLoading(prev => ({ ...prev, [suggestion.id]: false }));
      }

      // Format use case diagram
      setIsLoading(prev => ({ ...prev, useCaseDiagram: true }));
      try {
        const html = await formatMarkdown(artifacts.useCaseDiagram);
        console.log('Formatted use case diagram:', { content: artifacts.useCaseDiagram, html });
        setFormattedContent(prev => ({ ...prev, useCaseDiagram: html }));
      } catch (error) {
        console.error('Error formatting markdown:', error);
      }
      setIsLoading(prev => ({ ...prev, useCaseDiagram: false }));
    };

    formatAllContent();
  }, [artifacts]);

  const handleEdit = (id: string, content: string) => {
    setEditDialog({ isOpen: true, content, artifactId: id });
  };

  const handleSave = async (newValue: string) => {
    await onUpdate(editDialog.artifactId, newValue);
    setEditDialog({ isOpen: false, content: '', artifactId: '' });
  };

  const renderContent = (id: string) => {
    if (isLoading[id]) {
      return <LoadingSpinner />;
    }
    return (
      <div
        className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-pre:bg-gray-50 prose-pre:p-4 prose-pre:rounded-lg prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:not-italic prose-hr:border-gray-200"
        dangerouslySetInnerHTML={{
          __html: formattedContent[id] || ''
        }}
      />
    );
  };

  return (
      <div className="space-y-12">
      {/* User Stories */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">User Stories</h2>
          <button
            onClick={() => onRegenerate('user_story')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Regenerate
          </button>
        </div>
        <div className="space-y-6">
          {artifacts.userStories.map((story) => (
            <div key={story.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <MarkdownActions
                isLocked={story.is_locked}
                onEdit={() => handleEdit(story.id, story.content)}
                onToggleLock={() => onToggleLock(story.id)}
              >
                {renderContent(story.id)}
              </MarkdownActions>
            </div>
          ))}
        </div>
      </section>

      {/* Functional Requirements */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Functional Requirements</h2>
          <button
            onClick={() => onRegenerate('func_req')}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Regenerate
          </button>
        </div>
        <div className="space-y-6">
          {artifacts.functionalRequirements.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <MarkdownActions
                isLocked={req.is_locked}
                onEdit={() => handleEdit(req.id, req.content)}
                onToggleLock={() => onToggleLock(req.id)}
              >
                {renderContent(req.id)}
              </MarkdownActions>
            </div>
          ))}
        </div>
      </section>

      {/* Non-Functional Requirements */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Non-Functional Requirements</h2>
          <button
            onClick={() => onRegenerate('non_func_req')}
            className="text-blue-600 hover:text-blue-800"
          >
            Regenerate
          </button>
        </div>
        <div className="space-y-6">
          {artifacts.nonFunctionalRequirements.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <MarkdownActions
                isLocked={req.is_locked}
                onEdit={() => handleEdit(req.id, req.content)}
                onToggleLock={() => onToggleLock(req.id)}
              >
                {renderContent(req.id)}
              </MarkdownActions>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Suggestions */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Architecture Suggestions</h2>
          <button
            onClick={() => onRegenerate('arch_suggestion')}
            className="text-blue-600 hover:text-blue-800"
          >
            Regenerate
          </button>
        </div>
        <div className="space-y-6">
          {artifacts.architectureSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <MarkdownActions
                isLocked={suggestion.is_locked}
                onEdit={() => handleEdit(suggestion.id, suggestion.content)}
                onToggleLock={() => onToggleLock(suggestion.id)}
              >
                {renderContent(suggestion.id)}
              </MarkdownActions>
            </div>
          ))}
        </div>
      </section>

      {/* Use Case Diagram */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Use Case Diagram</h2>
          <button
            onClick={() => onRegenerate('use_case_diagram')}
            className="text-blue-600 hover:text-blue-800"
          >
            Regenerate
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {renderContent('useCaseDiagram')}
        </div>
      </section>

      <EditDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog({ isOpen: false, content: '', artifactId: '' })}
        onSave={handleSave}
        initialValue={editDialog.content}
        title="Edit Artifact"
        projectId={projectId}
        artifactType={getArtifactType(editDialog.artifactId, artifacts)}
      />
    </div>
  );
}
