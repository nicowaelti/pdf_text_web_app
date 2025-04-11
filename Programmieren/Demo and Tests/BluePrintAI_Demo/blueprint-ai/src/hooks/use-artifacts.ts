'use client';

import { useState, useCallback } from 'react';
import { GeneratedArtifacts, artifactTypeMap } from '@/types/artifacts';
import { ArtifactType } from '@/types/artifact-db';
import * as artifactService from '@/lib/artifact-service';

interface UseArtifactsProps {
  projectId: string;
  initialArtifacts: GeneratedArtifacts;
}

type ArrayArtifactKeys = keyof Omit<GeneratedArtifacts, 'useCaseDiagram'>;
type LoadingState = { [K in ArtifactType]?: string[] };

export function useArtifacts({ projectId, initialArtifacts }: UseArtifactsProps) {
  const [artifacts, setArtifacts] = useState<GeneratedArtifacts>(initialArtifacts);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({});

  const setItemLoading = (type: ArtifactType, id: string, isLoading: boolean) => {
    setLoading(prev => {
      if (isLoading) {
        return {
          ...prev,
          [type]: [...(prev[type] || []), id]
        };
      } else {
        return {
          ...prev,
          [type]: (prev[type] || []).filter((loadingId: string) => loadingId !== id)
        };
      }
    });
  };

  const setSectionLoading = (type: ArtifactType, isLoading: boolean) => {
    setLoading(prev => {
      if (isLoading) {
        return {
          ...prev,
          [type]: ['section']
        };
      } else {
        return {
          ...prev,
          [type]: []
        };
      }
    });
  };

  const regenerateSection = useCallback(async (
    type: ArtifactType, 
    description: string,
    additionalInstructions?: string
  ) => {
    setSectionLoading(type, true);
    try {
      const newItems = await artifactService.regenerateSection(
        projectId,
        description,
        type,
        additionalInstructions
      );
      
      setArtifacts(prev => {
        if (type === 'use_case_diagram') {
          return prev; // Don't regenerate use case diagram
        }

        const key = artifactTypeMap[type as keyof typeof artifactTypeMap];
        if (!key) return prev;

        // Keep locked items, add new items
        const lockedItems = prev[key].filter(item => item.is_locked);
        return {
          ...prev,
          [key]: [...lockedItems, ...newItems]
        } as GeneratedArtifacts;
      });

      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to regenerate section';
      setError(message);
      throw error;
    } finally {
      setSectionLoading(type, false);
    }
  }, [projectId]);

  const addItem = useCallback(async (type: ArtifactType, content: string) => {
    const tempId = `temp_${Date.now()}`;
    setItemLoading(type, tempId, true);
    try {
      const newArtifact = await artifactService.createArtifact(projectId, type, content);
      
      setArtifacts(prev => {
        if (type === 'use_case_diagram') {
          return { ...prev, useCaseDiagram: content };
        }

        const key = artifactTypeMap[type as keyof typeof artifactTypeMap];
        if (!key) return prev;

        return {
          ...prev,
          [key]: [...prev[key], { id: newArtifact.id, content: newArtifact.content ?? '', is_locked: newArtifact.is_locked }]
        } as GeneratedArtifacts;
      });

      setError(null);
      return newArtifact;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add item';
      setError(message);
      throw error;
    } finally {
      setItemLoading(type, tempId, false);
    }
  }, [projectId]);

  const updateItem = useCallback(async (type: ArtifactType, artifactId: string, newValue: string) => {
    setItemLoading(type, artifactId, true);
    try {
      await artifactService.updateArtifact(projectId, artifactId, newValue);
      
      setArtifacts(prev => {
        if (type === 'use_case_diagram') {
          return { ...prev, useCaseDiagram: newValue };
        }

        const key = artifactTypeMap[type as keyof typeof artifactTypeMap];
        if (!key) return prev;

        return {
          ...prev,
          [key]: prev[key].map((item) => 
            item.id === artifactId ? { ...item, content: newValue } : item
          )
        } as GeneratedArtifacts;
      });

      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update item';
      setError(message);
      throw error;
    } finally {
      setItemLoading(type, artifactId, false);
    }
  }, [projectId]);

  const deleteItem = useCallback(async (type: ArtifactType, artifactId: string) => {
    setItemLoading(type, artifactId, true);
    try {
      await artifactService.deleteArtifact(projectId, artifactId);
      
      setArtifacts(prev => {
        if (type === 'use_case_diagram') {
          return { ...prev, useCaseDiagram: '' };
        }

        const key = artifactTypeMap[type as keyof typeof artifactTypeMap];
        if (!key) return prev;

        return {
          ...prev,
          [key]: prev[key].filter((item) => item.id !== artifactId)
        } as GeneratedArtifacts;
      });

      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete item';
      setError(message);
      throw error;
    } finally {
      setItemLoading(type, artifactId, false);
    }
  }, [projectId]);

  const toggleLock = useCallback(async (type: ArtifactType, artifactId: string) => {
    setItemLoading(type, artifactId, true);
    try {
      const isLocked = await artifactService.toggleLock(projectId, artifactId);
      
      setArtifacts(prev => {
        if (type === 'use_case_diagram') {
          return prev; // Use case diagram doesn't have lock state
        }

        const key = artifactTypeMap[type as keyof typeof artifactTypeMap];
        if (!key) return prev;

        return {
          ...prev,
          [key]: prev[key].map((item) => 
            item.id === artifactId ? { ...item, is_locked: isLocked } : item
          )
        } as GeneratedArtifacts;
      });

      setError(null);
      return isLocked;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle lock';
      setError(message);
      throw error;
    } finally {
      setItemLoading(type, artifactId, false);
    }
  }, [projectId]);

  return {
    artifacts,
    error,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleLock,
    regenerateSection,
    updateDiagram: updateItem,
    isItemLoading: (type: ArtifactType, id: string) => 
      (loading[type] || []).includes(id),
    isSectionLoading: (type: ArtifactType) =>
      (loading[type] || []).includes('section')
  };
}
