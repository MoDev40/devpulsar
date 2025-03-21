
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import {
  fetchTasks,
  createTask,
  updateTaskCompletion,
  removeTask,
  updateTask,
  fetchTaskById,
} from "@/api/taskApi";
import { Task, TaskCategory, TaskPriority, TaskTag } from "@/types";
import { TaskStore } from "./taskTypes";

export const createTaskActions = (
  set: (
    state: Partial<TaskStore> | ((state: TaskStore) => Partial<TaskStore>)
  ) => void,
  get: () => TaskStore
) => {
  // Channel reference for Supabase real-time
  let channel: ReturnType<typeof supabase.channel> | null = null;

  return {
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
      priority: TaskPriority,
      dueDate?: Date | null,
      reminder?: Date | null,
      tags?: TaskTag[]
    ) => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to add tasks");
        return;
      }

      try {
        const newTask = await createTask(
          user.id,
          title,
          category,
          priority,
          dueDate,
          reminder,
          tags
        );

        if (newTask) {
          // Add to local state optimistically
          set((state) => ({
            tasks: [newTask, ...state.tasks],
          }));
          toast.success("Task added");

          // Set up a reminder notification if applicable
          if (reminder) {
            const now = new Date();
            const timeUntilReminder = reminder.getTime() - now.getTime();
            
            // Only set the timeout if it's in the future
            if (timeUntilReminder > 0) {
              setTimeout(() => {
                toast.info(`Reminder: ${title}`, {
                  description: `Your task "${title}" is due soon!`,
                });
              }, timeUntilReminder);
            }
          }
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
        
        // If we just set a reminder, check if we need to schedule a notification
        if (updates.reminder) {
          const now = new Date();
          const timeUntilReminder = updates.reminder.getTime() - now.getTime();
          
          // Only set the timeout if it's in the future
          if (timeUntilReminder > 0) {
            // Find the task to get its title
            const task = get().tasks.find(t => t.id === id);
            if (task) {
              setTimeout(() => {
                toast.info(`Reminder: ${task.title}`, {
                  description: `Your task "${task.title}" is due soon!`,
                });
              }, timeUntilReminder);
            }
          }
        }
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
          // If we can't fetch the current state, just set the error
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
};
