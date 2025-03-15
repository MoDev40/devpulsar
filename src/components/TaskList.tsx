
import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import TaskItem from '@/components/TaskItem';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Plus, Filter } from 'lucide-react';
import { TaskCategory, TaskPriority } from '@/types';

const TaskList: React.FC = () => {
  const { tasks, addTask } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('feature');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskCategory, newTaskPriority);
      setNewTaskTitle('');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.completed) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-8">
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
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">Tasks ({filteredTasks.length})</h2>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </CustomButton>
      </div>
      
      {showFilters && (
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
      )}
      
      <div className="space-y-0.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
