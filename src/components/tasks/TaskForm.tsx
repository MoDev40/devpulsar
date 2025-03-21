
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Plus, Calendar, Clock, Tag } from 'lucide-react';
import { TaskCategory, TaskPriority, TaskTag } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const TaskForm: React.FC = () => {
  const { addTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('feature');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskCategory, newTaskPriority, dueDate, reminder, tags);
      setNewTaskTitle('');
      setDueDate(null);
      setReminder(null);
      setTags([]);
      setNewTag('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSetReminder = () => {
    // Set reminder to 1 hour from now
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 1);
    setReminder(reminderTime);
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
      
      <div className="flex flex-wrap gap-3 items-end">
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

        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Due Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <CustomButton
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9"
              >
                <Calendar className="h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : 'Set due date'}
              </CustomButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dueDate || undefined}
                onSelect={setDueDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Reminder
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <CustomButton
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9"
              >
                <Clock className="h-4 w-4" />
                {reminder ? format(reminder, 'PPP p') : 'Set reminder'}
              </CustomButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="space-y-2">
                <div className="text-sm font-medium">Set reminder</div>
                <CustomButton 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSetReminder}
                  className="text-xs w-full"
                >
                  1 hour from now
                </CustomButton>
                {reminder && (
                  <CustomButton 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReminder(null)}
                    className="text-xs w-full"
                  >
                    Clear reminder
                  </CustomButton>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {(dueDate || reminder) && (
          <CustomButton 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setDueDate(null);
              setReminder(null);
            }}
            className="text-xs"
          >
            Clear all dates
          </CustomButton>
        )}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center"
            >
              {tag}
              <button 
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-800 hover:text-blue-900"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTag}
          >
            <Tag className="h-4 w-4 mr-1" />
            Add Tag
          </CustomButton>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
