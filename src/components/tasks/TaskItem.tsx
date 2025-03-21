
import React, { useState } from 'react';
import { Task, TaskTag } from '@/types';
import { Trash, Edit, Check, X, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskStore } from '@/store/taskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isAfter, isBefore, isToday, addDays, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask, editTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedCategory, setEditedCategory] = useState(task.category);
  const [editedPriority, setEditedPriority] = useState(task.priority);
  const [editedDueDate, setEditedDueDate] = useState<Date | null>(task.dueDate || null);
  const [editedReminder, setEditedReminder] = useState<Date | null>(task.reminder || null);
  const [editedTags, setEditedTags] = useState<TaskTag[]>(task.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleEdit = () => {
    editTask(task.id, {
      title: editedTitle,
      category: editedCategory,
      priority: editedPriority,
      dueDate: editedDueDate,
      reminder: editedReminder,
      tags: editedTags,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedCategory(task.category);
    setEditedPriority(task.priority);
    setEditedDueDate(task.dueDate || null);
    setEditedReminder(task.reminder || null);
    setEditedTags(task.tags || []);
    setNewTag('');
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-red-50 text-red-700',
  };

  // Function to determine the due date status and styling
  const getDueDateStatus = () => {
    if (!task.dueDate) return { text: '', className: '' };
    
    const now = new Date();
    const tomorrow = addDays(now, 1);
    
    if (task.completed) {
      return { 
        text: `Due: ${format(task.dueDate, 'MMM d')}`, 
        className: 'text-muted-foreground line-through' 
      };
    } else if (isBefore(task.dueDate, now) && !isToday(task.dueDate)) {
      return { 
        text: `Overdue: ${format(task.dueDate, 'MMM d')}`, 
        className: 'text-red-600 font-medium' 
      };
    } else if (isToday(task.dueDate)) {
      return { 
        text: 'Due today', 
        className: 'text-amber-600 font-medium' 
      };
    } else if (isBefore(task.dueDate, tomorrow)) {
      return { 
        text: 'Due tomorrow', 
        className: 'text-blue-600 font-medium' 
      };
    }
    
    return { 
      text: `Due: ${format(task.dueDate, 'MMM d')}`, 
      className: 'text-muted-foreground' 
    };
  };

  const getReminderStatus = () => {
    if (!task.reminder) return { text: '', className: '' };
    
    const now = new Date();
    
    if (task.completed) {
      return { 
        text: `Reminder: ${format(task.reminder, 'MMM d, h:mm a')}`, 
        className: 'text-muted-foreground line-through' 
      };
    } else if (isBefore(task.reminder, now)) {
      return { 
        text: `Reminder passed: ${format(task.reminder, 'MMM d, h:mm a')}`, 
        className: 'text-red-600 font-medium' 
      };
    }
    
    return { 
      text: `Reminder: ${format(task.reminder, 'MMM d, h:mm a')}`, 
      className: 'text-purple-600 font-medium' 
    };
  };

  const dueDateStatus = getDueDateStatus();
  const reminderStatus = getReminderStatus();

  const handleSetReminder = () => {
    // Set reminder to 1 hour from now
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 1);
    setEditedReminder(reminderTime);
    
    // In a real application, you would integrate with a notification system
    toast.success(`Reminder set for ${format(reminderTime, 'MMM d, h:mm a')}`);
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

              <Popover>
                <PopoverTrigger asChild>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-7 text-xs"
                  >
                    <Calendar className="h-3 w-3" />
                    {editedDueDate ? format(editedDueDate, 'MMM d') : 'Set date'}
                  </CustomButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={editedDueDate || undefined}
                    onSelect={setEditedDueDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                  {editedDueDate && (
                    <div className="p-2 border-t border-border">
                      <CustomButton 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditedDueDate(null)}
                        className="text-xs w-full"
                      >
                        Clear date
                      </CustomButton>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 h-7 text-xs"
                  >
                    <Clock className="h-3 w-3" />
                    {editedReminder ? format(editedReminder, 'MMM d, h:mm a') : 'Set reminder'}
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
                    {editedReminder && (
                      <CustomButton 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditedReminder(null)}
                        className="text-xs w-full"
                      >
                        Clear reminder
                      </CustomButton>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Tags</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {editedTags.map(tag => (
                  <span 
                    key={tag} 
                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-2 py-1 text-xs border border-input rounded-md"
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
                  className="text-xs h-6"
                >
                  Add
                </CustomButton>
              </div>
            </div>
          </div>
            
          <div className="flex space-x-2">
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
    );
  }

  return (
    <div className={`task-item ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center mr-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskCompletion(task.id, !task.completed)}
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
          {task.dueDate && (
            <span className={cn("text-xs flex items-center gap-1", dueDateStatus.className)}>
              <Calendar className="h-3 w-3" />
              {dueDateStatus.text}
            </span>
          )}
          {task.reminder && (
            <span className={cn("text-xs flex items-center gap-1", reminderStatus.className)}>
              <Clock className="h-3 w-3" />
              {reminderStatus.text}
            </span>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
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
          onClick={() => toast.info("Sharing coming soon!")}
          className="h-8 w-8 p-0 flex items-center justify-center"
        >
          <Share2 className="h-4 w-4" />
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
