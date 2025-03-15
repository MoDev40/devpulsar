
import React, { useState } from 'react';
import { Task } from '@/types';
import { Trash, Edit, Check, ChevronUp, ChevronDown, X } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskContext } from '@/context/TaskContext';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, editTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedCategory, setEditedCategory] = useState(task.category);
  const [editedPriority, setEditedPriority] = useState(task.priority);

  const handleEdit = () => {
    editTask(task.id, {
      title: editedTitle,
      category: editedCategory,
      priority: editedPriority,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedCategory(task.category);
    setEditedPriority(task.priority);
    setIsEditing(false);
  };

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-red-50 text-red-700',
  };

  if (isEditing) {
    return (
      <div className="task-item animate-fade-in">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            autoFocus
          />
          
          <div className="flex flex-wrap gap-2 sm:items-center">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <select
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value as any)}
                className="px-2 py-1 text-xs border border-input rounded-md"
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="enhancement">Enhancement</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value as any)}
                className="px-2 py-1 text-xs border border-input rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="ml-auto flex space-x-2">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex items-center"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </CustomButton>
              <CustomButton
                variant="default"
                size="sm"
                onClick={handleEdit}
                className="flex items-center"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center mr-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskCompletion(task.id)}
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-start">
          <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center mt-1 gap-2">
          <span className={`category-badge ${task.category}`}>{task.category}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-1">
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 flex items-center justify-center"
        >
          <Edit className="h-4 w-4" />
        </CustomButton>
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={() => deleteTask(task.id)}
          className="h-8 w-8 p-0 flex items-center justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-4 w-4" />
        </CustomButton>
      </div>
    </div>
  );
};

export default TaskItem;
