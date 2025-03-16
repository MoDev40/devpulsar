
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Plus } from 'lucide-react';
import { TaskCategory, TaskPriority } from '@/types';
import { useTaskStore } from '@/store/taskStore';

const TaskForm: React.FC = () => {
  const { addTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('feature');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskCategory, newTaskPriority);
      setNewTaskTitle('');
    }
  };
  
  return (
    <form onSubmit={handleAddTask} className="glass-card p-4 rounded-lg space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <CustomButton type="submit" className="flex items-center justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </CustomButton>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="category" className="block text-xs text-muted-foreground mb-1">
            Category
          </label>
          <select
            id="category"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
            className="px-3 py-1.5 text-sm border border-input rounded-md bg-background"
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="enhancement">Enhancement</option>
            <option value="documentation">Documentation</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-xs text-muted-foreground mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
            className="px-3 py-1.5 text-sm border border-input rounded-md bg-background"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
