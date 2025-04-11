import { useState, useCallback } from 'react';
import { TaskStack, TaskStatus, TaskRecord } from '@/types/task';

export function useTasks(initialTasks: TaskStack) {
  const [tasks, setTasks] = useState<TaskStack>(initialTasks);

  const setAllTasks = useCallback((newTasks: TaskStack) => {
    setTasks(newTasks);
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Update local state
      setTasks(prev => {
        // Find the task in the current state
        let task: TaskRecord | undefined;
        let currentStatus: TaskStatus | undefined;

        for (const [status, taskList] of Object.entries(prev) as [TaskStatus, TaskRecord[]][]) {
          const found = taskList.find(t => t.id === taskId);
          if (found) {
            task = found;
            currentStatus = status;
            break;
          }
        }

        if (!task || !currentStatus) return prev;

        // Remove from old status array
        const oldStatusTasks = prev[currentStatus].filter(t => t.id !== taskId);
        // Add to new status array with updated status
        const newStatusTasks = [...prev[newStatus], { ...task, status: newStatus }];

        return {
          ...prev,
          [currentStatus]: oldStatusTasks,
          [newStatus]: newStatusTasks
        };
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }, []);

  return {
    tasks,
    updateTaskStatus,
    setAllTasks
  };
}
