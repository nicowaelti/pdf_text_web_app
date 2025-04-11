'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorToast } from '@/components/error-toast';
import { ArtifactsDisplay } from '@/components/artifacts-display';
import { GeneratedArtifacts } from '@/types/artifacts';
import { updateArtifact, regenerateSection, toggleLock } from '@/lib/artifact-service';
import { ArtifactType } from '@/types/artifact-db';
import { InputForm } from '@/components/input-form';
export default function RequirementsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<GeneratedArtifacts | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (description: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate artifacts');
      }

      const data = await response.json();
      setProjectId(data.project.id);
      setArtifacts(data.artifacts);

      // Store project ID in localStorage
      localStorage.setItem('currentProjectId', data.project.id);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    try {
      if (!projectId) return;
      await updateArtifact(projectId, id, content);
      
      // Fetch updated artifacts
      const response = await fetch(`/api/artifacts?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch updated artifacts');
      
      const { artifacts: updatedArtifacts } = await response.json();
      setArtifacts(updatedArtifacts);
    } catch (error) {
      console.error('Error updating artifact:', error);
      setError(error instanceof Error ? error.message : 'Failed to update artifact');
    }
  };

  const handleToggleLock = async (id: string) => {
    try {
      if (!projectId) return;
      await toggleLock(projectId, id);
      
      // Fetch updated artifacts
      const response = await fetch(`/api/artifacts?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch updated artifacts');
      
      const { artifacts: updatedArtifacts } = await response.json();
      setArtifacts(updatedArtifacts);
    } catch (error) {
      console.error('Error toggling lock:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle lock');
    }
  };

  const handleRegenerate = async (section: ArtifactType) => {
    try {
      if (!projectId || !artifacts) return;
      const response = await fetch(`/api/artifacts?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project data');
      const { project } = await response.json();
      
      await regenerateSection(projectId, project.description || '', section);
      
      // Fetch updated artifacts after regeneration
      const updatedResponse = await fetch(`/api/artifacts?projectId=${projectId}`);
      if (!updatedResponse.ok) throw new Error('Failed to fetch updated artifacts');
      
      const { artifacts: updatedArtifacts } = await updatedResponse.json();
      setArtifacts(updatedArtifacts);
    } catch (error) {
      console.error('Error regenerating section:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate section');
    }
  };

  // Fetch artifacts if we have a project ID but no artifacts
  useEffect(() => {
    async function fetchData() {
      if (!projectId || artifacts) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/artifacts?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artifacts');
        }
        
        const { artifacts: fetchedArtifacts } = await response.json();
        if (!fetchedArtifacts) {
          throw new Error('No artifacts data in response');
        }
        
        setArtifacts(fetchedArtifacts);
      } catch (error) {
        console.error('Error fetching artifacts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load artifacts');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchData();
  }, [projectId, artifacts]);

  // Check for existing project on mount
  useEffect(() => {
    const pid = localStorage.getItem('currentProjectId');
    if (pid) {
      setProjectId(pid);
    }
  }, []);

  return (
    <div className="h-full overflow-auto bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Project Requirements</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and manage project requirements and specifications.
          </p>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorToast
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {!artifacts && !isLoading && (
          <div className="mb-12">
            <p className="mb-6 text-gray-600">
              Enter a project description to generate requirements and specifications.
            </p>
            <InputForm onSubmit={handleSubmit} isLoading={isGenerating} />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {artifacts && projectId && (
          <ArtifactsDisplay
            projectId={projectId}
            artifacts={artifacts}
            onUpdate={handleUpdate}
            onToggleLock={handleToggleLock}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
}
