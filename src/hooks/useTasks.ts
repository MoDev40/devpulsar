
import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { 
  fetchTasks, 
  createTask, 
  updateTaskCompletion, 
  removeTask, 
  updateTask, 
  fetchTaskById 
} from '@/api/taskApi';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuthStore();

  // Fetch tasks when user changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        return;
      }
      
      const fetchedTasks = await fetchTasks(user.id);
      setTasks(fetchedTasks);
    };

    loadTasks();
  }, [user]);

  const addTask = async (title: string, category: TaskCategory, priority: TaskPriority) => {
    if (!user) return;

    const newTask = await createTask(user.id, title, category, priority);
    
    if (newTask) {
      // Add to local state optimistically
      setTasks((prevTasks) => [newTask, ...prevTasks]);
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

    const success = await updateTaskCompletion(id, updatedTask.completed);
    
    if (!success) {
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

    // Store the task for possible restoration
    const taskToDelete = tasks.find(task => task.id === id);
    
    // Delete locally first
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    
    const success = await removeTask(id);
    
    if (!success && taskToDelete) {
      // Restore task if deletion failed
      setTasks((prevTasks) => [...prevTasks, taskToDelete]);
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
    
    const success = await updateTask(id, updates);
    
    if (!success) {
      // Fetch the current state to revert changes
      const currentTask = await fetchTaskById(id);
      
      if (currentTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? currentTask : task
          )
        );
      }
    }
  };

  return {
    tasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    editTask
  };
}
