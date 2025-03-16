import { create } from "zustand";
import { Task, TaskCategory, TaskPriority } from "@/types";
import {
  fetchTasks,
  createTask,
  updateTaskCompletion,
  removeTask,
  updateTask,
  fetchTaskById,
} from "@/api/taskApi";
import { useAuthStore } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

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

export const useTaskStore = create<TaskState>((set, get) => {
  // Create a channel for real-time updates
  let channel: any = null;

  return {
    tasks: [],
    loading: false,
    error: null,

    loadTasks: async () => {
      const { user } = useAuthStore.getState();

      if (!user) {
        set({ tasks: [], loading: false });
        return;
      }

      set({ loading: true, error: null });

      try {
        const fetchedTasks = await fetchTasks(user.id);
        set({ tasks: fetchedTasks, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        toast.error("Failed to load tasks");
      }
    },

    addTask: async (
      title: string,
      category: TaskCategory,
      priority: TaskPriority
    ) => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to add tasks");
        return;
      }

      try {
        const newTask = await createTask(user.id, title, category, priority);

        if (newTask) {
          // Add to local state optimistically
          set((state) => ({
            tasks: [newTask, ...state.tasks],
          }));
          toast.success("Task added");
        }
      } catch (error: any) {
        set({ error: error.message });
        toast.error("Failed to add task");
      }
    },

    toggleTaskCompletion: async (id, isComplete) => {
      const { user } = useAuthStore.getState();

      if (!user) return;

      // Update locally first (optimistic update)
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ),
      }));

      try {
        // Get the updated completion status
        await updateTaskCompletion(id, isComplete);
      } catch (error: any) {
        // Revert changes if failed
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
          error: error.message,
        }));
        toast.error("Failed to update task");
      }
    },

    deleteTask: async (id: string) => {
      const { user } = useAuthStore.getState();
      const { tasks } = get();

      if (!user) return;

      // Store the task for possible restoration
      const taskToDelete = tasks.find((task) => task.id === id);

      // Delete locally first (optimistic update)
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));

      try {
        await removeTask(id);
        toast.success("Task deleted");
      } catch (error: any) {
        // Restore task if deletion failed
        if (taskToDelete) {
          set((state) => ({
            tasks: [...state.tasks, taskToDelete],
            error: error.message,
          }));
        }
        toast.error("Failed to delete task");
      }
    },

    editTask: async (
      id: string,
      updates: Partial<Omit<Task, "id" | "createdAt">>
    ) => {
      const { user } = useAuthStore.getState();

      if (!user) return;

      // Update locally first (optimistic update)
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      }));

      try {
        await updateTask(id, updates);
        toast.success("Task updated");
      } catch (error: any) {
        try {
          // Fetch the current state to revert changes
          const currentTask = await fetchTaskById(id);

          if (currentTask) {
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === id ? currentTask : task
              ),
              error: error.message,
            }));
          }
        } catch (fetchError) {
          // If we can't fetch the current state, revert to the previous state
          set((state) => ({
            error: error.message,
          }));
        }
        toast.error("Failed to update task");
      }
    },

    subscribeToTasks: () => {
      const { user } = useAuthStore.getState();
      const { loadTasks } = get();

      if (!user) return;

      // Unsubscribe from any existing channel first
      if (channel) {
        supabase.removeChannel(channel);
      }

      // Set up real-time subscription
      channel = supabase
        .channel("public:tasks")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Reload tasks to ensure consistency
            loadTasks();
          }
        )
        .subscribe();
    },

    unsubscribeFromTasks: () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    },
  };
});
