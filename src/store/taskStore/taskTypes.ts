
import { Task, TaskCategory, TaskPriority, TaskTag } from '@/types';

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  sortBy: 'dueDate' | 'priority' | 'category' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

export interface TaskStore extends TaskState {
  // Actions
  loadTasks: () => Promise<void>;
  addTask: (
    title: string,
    category: TaskCategory,
    priority: TaskPriority,
    dueDate?: Date | null,
    reminder?: Date | null,
    tags?: TaskTag[]
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
  
  // Sorting and filtering
  setSortBy: (sortBy: TaskState['sortBy']) => void;
  setSortDirection: (direction: TaskState['sortDirection']) => void;
  
  // Statistics getters
  getCompletedTasksCount: () => number;
  getIncompleteTasksCount: () => number;
  getTasksByCategory: () => Record<TaskCategory, number>;
  getTasksByPriority: () => Record<TaskPriority, number>;
  getOverdueTasks: () => Task[];
  getDueTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
}
