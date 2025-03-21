
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskCategory, TaskPriority, TaskTag } from '@/types';
import { toast } from 'sonner';

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
      dueDate: task.due_date ? new Date(task.due_date) : null,
      reminder: task.reminder ? new Date(task.reminder) : null,
      tags: Array.isArray(task.tags) ? task.tags : [],
      sharedWith: Array.isArray(task.shared_with) ? task.shared_with : [],
    }));

    return transformedTasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Failed to load your tasks');
    return [];
  }
}

export async function createTask(
  userId: string | undefined, 
  title: string, 
  category: TaskCategory, 
  priority: TaskPriority,
  dueDate?: Date | null,
  reminder?: Date | null,
  tags?: TaskTag[]
) {
  if (!userId) {
    toast.error('Please log in to add tasks');
    return null;
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    category,
    priority,
    createdAt: new Date(),
    dueDate: dueDate || null,
    reminder: reminder || null,
    tags: tags || [],
    sharedWith: [],
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
      due_date: newTask.dueDate ? newTask.dueDate.toISOString() : null,
      reminder: newTask.reminder ? newTask.reminder.toISOString() : null,
      tags: newTask.tags,
      shared_with: newTask.sharedWith || [],
    });

    if (error) throw error;
    toast.success('Task added successfully');
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    toast.error('Failed to save your task');
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
    toast.error('Failed to update task');
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
    toast.success('Task deleted');
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Failed to delete task');
    return false;
  }
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    // Convert dates to ISO string format if they exist
    const formattedUpdates = {
      ...updates,
      due_date: updates.dueDate ? updates.dueDate.toISOString() : updates.dueDate === null ? null : undefined,
      reminder: updates.reminder ? updates.reminder.toISOString() : updates.reminder === null ? null : undefined,
      tags: updates.tags,
      shared_with: updates.sharedWith,
    };
    
    // Remove properties that don't match the database schema
    if ('dueDate' in formattedUpdates) {
      delete formattedUpdates.dueDate;
    }
    if ('reminder' in formattedUpdates) {
      delete formattedUpdates.reminder;
    }
    if ('sharedWith' in formattedUpdates) {
      delete formattedUpdates.sharedWith;
    }
    
    const { error } = await supabase
      .from('tasks')
      .update(formattedUpdates)
      .eq('id', id);

    if (error) throw error;
    toast.success('Task updated');
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    toast.error('Failed to update task');
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
      dueDate: data.due_date ? new Date(data.due_date) : null,
      reminder: data.reminder ? new Date(data.reminder) : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      sharedWith: Array.isArray(data.shared_with) ? data.shared_with : [],
    } : null;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}
