
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category: TaskCategory, priority: TaskPriority) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Fetch tasks from Supabase when user changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match our Task type
        const transformedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          category: task.category as TaskCategory,
          priority: task.priority as TaskPriority,
          createdAt: new Date(task.created_at),
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load your tasks');
      }
    };

    fetchTasks();
  }, [user]);

  const addTask = async (title: string, category: TaskCategory, priority: TaskPriority) => {
    if (!user) {
      toast.error('Please log in to add tasks');
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      category,
      priority,
      createdAt: new Date(),
    };
    
    // Add to local state optimistically
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    
    try {
      const { error } = await supabase.from('tasks').insert({
        id: newTask.id,
        user_id: user.id,
        title: newTask.title,
        completed: newTask.completed,
        category: newTask.category,
        priority: newTask.priority,
        created_at: newTask.createdAt.toISOString(),
      });

      if (error) throw error;
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to save your task');
      
      // Remove from local state if failed
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== newTask.id));
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    if (!user) return;

    // Update locally first
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

    // Get the updated completion status
    const updatedTask = tasks.find(task => task.id === id);
    if (!updatedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: updatedTask.completed })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast.error('Failed to update task');
      
      // Revert changes if failed
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    // Delete locally first
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      
      // Restore task if deletion failed
      const deletedTask = tasks.find(task => task.id === id);
      if (deletedTask) {
        setTasks((prevTasks) => [...prevTasks, deletedTask]);
      }
    }
  };

  const editTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (!user) return;

    // Update locally first
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      
      // Fetch the current state to revert changes
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? {
              ...task,
              title: data.title,
              completed: data.completed,
              category: data.category,
              priority: data.priority,
            } : task
          )
        );
      }
    }
  };

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
