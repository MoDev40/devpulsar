
import React, { createContext, useContext } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { useTasks } from '@/hooks/useTasks';

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category: TaskCategory, priority: TaskPriority) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    tasks, 
    addTask, 
    toggleTaskCompletion, 
    deleteTask, 
    editTask 
  } = useTasks();

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        editTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
