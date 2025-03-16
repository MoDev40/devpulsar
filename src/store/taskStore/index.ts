
import { create } from 'zustand';
import { TaskStore, TaskState } from './taskTypes';
import { createTaskActions } from './taskActions';

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Create the task store
export const useTaskStore = create<TaskStore>((set, get) => {
  return {
    ...initialState,
    ...createTaskActions(set, get),
  };
});

export * from './taskTypes';
