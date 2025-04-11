'use client';

import { useEffect, useState } from 'react';
import { TaskCard } from '@/components/tasks/task-card';
import { useTasks } from '@/hooks/use-tasks';
import { TaskStack, TaskStatus } from '@/types/task';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorToast } from '@/components/error-toast';

const statusColumns: { title: string; status: TaskStatus }[] = [
  { title: 'To Do', status: 'open' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Done', status: 'done' }
];

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with empty task stack
  const initialTasks: TaskStack = {
    open: [],
    in_progress: [],
    done: []
  };

  const { tasks, updateTaskStatus, setAllTasks } = useTasks(initialTasks);

  // Fetch tasks on mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        // Get project ID from localStorage
        const projectId = localStorage.getItem('currentProjectId');
        if (!projectId) {
          setError('No project selected');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/tasks?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const taskStack = await response.json();
        setAllTasks(taskStack);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchTasks();
  }, [setAllTasks]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
        />
        <p className="mt-4 text-gray-600">
          Please select a project to view its tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Project Tasks</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage implementation tasks and track their progress.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {statusColumns.map(({ title, status }) => (
          <div
            key={status}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h2 className="font-medium text-gray-900 mb-4">
              {title} ({tasks[status].length})
            </h2>
            <div className="space-y-3 overflow-auto h-full pb-4">
              {tasks[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                />
              ))}
              {tasks[status].length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
