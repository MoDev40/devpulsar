
import React from 'react';
import { TaskCategory, TaskPriority } from '@/types';

interface TaskFiltersProps {
  categoryFilter: TaskCategory | 'all';
  setCategoryFilter: (category: TaskCategory | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  dueDateFilter: 'all' | 'overdue' | 'today' | 'upcoming' | 'none';
  setDueDateFilter: (filter: 'all' | 'overdue' | 'today' | 'upcoming' | 'none') => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  showCompleted,
  setShowCompleted,
  dueDateFilter,
  setDueDateFilter,
}) => {
  return (
    <div className="mb-6 glass-card p-4 rounded-lg space-y-3 animate-fade-in">
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="categoryFilter" className="block text-xs text-muted-foreground mb-1">
            Category
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-2 py-1 text-sm border border-input rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="enhancement">Enhancement</option>
            <option value="documentation">Documentation</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="priorityFilter" className="block text-xs text-muted-foreground mb-1">
            Priority
          </label>
          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-2 py-1 text-sm border border-input rounded-md"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dueDateFilter" className="block text-xs text-muted-foreground mb-1">
            Due Date
          </label>
          <select
            id="dueDateFilter"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value as any)}
            className="px-2 py-1 text-sm border border-input rounded-md"
          >
            <option value="all">All Due Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="none">No Due Date</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
              className="mr-2 h-4 w-4"
            />
            <span className="text-sm">Show Completed</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
