
import { create } from "zustand";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { TaskStore, TaskState } from "./taskTypes";
import { isAfter, isBefore, isToday, startOfDay, addDays } from "date-fns";

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  sortBy: "dueDate",
  sortDirection: "asc",
};
import { createTaskActions } from "./taskActions";

// Create the store
export const useTaskStore = create<TaskStore>((set, get) => ({
  ...initialState,
  ...createTaskActions(set, get),
  // New sorting functionality
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDirection: (sortDirection) => set({ sortDirection }),

  // Statistics
  getCompletedTasksCount: () => {
    return get().tasks.filter((task) => task.completed).length;
  },

  getIncompleteTasksCount: () => {
    return get().tasks.filter((task) => !task.completed).length;
  },

  getTasksByCategory: () => {
    const result: Record<TaskCategory, number> = {
      bug: 0,
      feature: 0,
      enhancement: 0,
      documentation: 0,
      other: 0,
    };

    get().tasks.forEach((task) => {
      result[task.category]++;
    });

    return result;
  },

  getTasksByPriority: () => {
    const result: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    get().tasks.forEach((task) => {
      result[task.priority]++;
    });

    return result;
  },

  getOverdueTasks: () => {
    const today = startOfDay(new Date());
    return get().tasks.filter(
      (task) => !task.completed && task.dueDate && isBefore(task.dueDate, today)
    );
  },

  getDueTodayTasks: () => {
    return get().tasks.filter(
      (task) => !task.completed && task.dueDate && isToday(task.dueDate)
    );
  },

  getUpcomingTasks: () => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    return get().tasks.filter(
      (task) =>
        !task.completed && task.dueDate && isAfter(task.dueDate, tomorrow)
    );
  },
}));
