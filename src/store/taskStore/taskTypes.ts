
import { Task, TaskCategory, TaskPriority } from '@/types';

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export interface TaskStore extends TaskState {
  // Actions
  loadTasks: () => Promise<void>;
  addTask: (
    title: string,
    category: TaskCategory,
    priority: TaskPriority
  ) => Promise<void>;
  toggleTaskCompletion: (id: string, isComplete: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  editTask: (
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ) => Promise<void>;

  // Subscription management
  subscribeToTasks: () => void;
  unsubscribeFromTasks: () => void;
}
