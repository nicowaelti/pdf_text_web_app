'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { TaskUpdateToast } from './task-update-toast';
import { evaluateArtifactChanges } from '@/lib/artifact-service';
import { ArtifactType } from '@/types/artifact-db';

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
  initialValue: string;
  title: string;
  projectId: string;
  artifactType: ArtifactType;
}

export function EditDialog({
  isOpen,
  onClose,
  onSave,
  initialValue,
  title,
  projectId,
  artifactType
}: EditDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [taskUpdateInfo, setTaskUpdateInfo] = useState<{
    show: boolean;
    reason?: string;
  }>({ show: false });

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // First evaluate if tasks need updating
      const evaluation = await evaluateArtifactChanges(
        projectId,
        initialValue,
        value,
        artifactType
      );

      // Save the changes
      await onSave(value);

      // Show task update notification if needed
      if (evaluation.updated) {
        setTaskUpdateInfo({ show: true, reason: evaluation.reason });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="dialog-overlay">
        <div className="dialog-content">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>

          <div className="p-6 flex-1 overflow-auto">
            <textarea
              className="form-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="p-6 border-t flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!value.trim() || isLoading}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      
      {taskUpdateInfo.show && taskUpdateInfo.reason && (
        <TaskUpdateToast
          reason={taskUpdateInfo.reason}
          onClose={() => setTaskUpdateInfo({ show: false })}
        />
      )}
    </>
  );
}
