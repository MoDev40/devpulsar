import { supabase } from '@/integrations/supabase/client';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { toast as sonnerToast } from 'sonner';
import { toast as shadcnToast } from '@/hooks/use-toast';

// Check if this is a first visit
const isFirstVisit = localStorage.getItem('has-visited') !== 'true';
const toast = isFirstVisit ? shadcnToast : sonnerToast;

export async function fetchTasks(userId: string | undefined) {
  if (!userId) {
    return [];
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
      github_issue_url: task.github_issue_url
    }));

    return transformedTasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Failed to load your tasks",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Failed to load your tasks');
    }
    return [];
  }
}

export async function createTask(
  userId: string | undefined, 
  title: string, 
  category: TaskCategory, 
  priority: TaskPriority,
  github_issue_url?: string
) {
  if (!userId) {
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Please log in to add tasks",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Please log in to add tasks');
    }
    return null;
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    category,
    priority,
    createdAt: new Date(),
    github_issue_url
  };
  
  try {
    const { error } = await supabase.from('tasks').insert({
      id: newTask.id,
      user_id: userId,
      title: newTask.title,
      completed: newTask.completed,
      category: newTask.category,
      priority: newTask.priority,
      created_at: newTask.createdAt.toISOString(),
      github_issue_url: newTask.github_issue_url
    });

    if (error) throw error;
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Success",
        description: "Task added successfully",
      });
    } else {
      sonnerToast.success('Task added successfully');
    }
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Failed to save your task",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Failed to save your task');
    }
    
    return null;
  }
}

export async function updateTaskCompletion(id: string, isCompleted: boolean) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: isCompleted })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating task completion:', error);
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Failed to update task');
    }
    
    return false;
  }
}

export async function removeTask(id: string) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Success",
        description: "Task deleted",
      });
    } else {
      sonnerToast.success('Task deleted');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Failed to delete task');
    }
    
    return false;
  }
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Success",
        description: "Task updated",
      });
    } else {
      sonnerToast.success('Task updated');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (isFirstVisit) {
      shadcnToast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } else {
      sonnerToast.error('Failed to update task');
    }
    
    return false;
  }
}

export async function fetchTaskById(id: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
        
    if (error) throw error;
    
    return data ? {
      id: data.id,
      title: data.title,
      completed: data.completed,
      category: data.category as TaskCategory,
      priority: data.priority as TaskPriority,
      createdAt: new Date(data.created_at),
      github_issue_url: data.github_issue_url
    } : null;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}
