import { TaskRecord } from '@/types/task';

interface TaskCardProps {
  task: TaskRecord;
  onStatusChange: (taskId: string, newStatus: TaskRecord['status']) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskRecord['status'])}
          className="text-xs border rounded px-1 py-0.5 text-gray-600"
        >
          <option value="open">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
      )}
      <div className="mt-3 flex items-center text-xs text-gray-500">
        <span className="flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(task.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
