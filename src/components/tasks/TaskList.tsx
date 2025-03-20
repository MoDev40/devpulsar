
import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import { CustomButton } from '@/components/ui/custom-button';
import { Filter } from 'lucide-react';
import { TaskCategory, TaskPriority } from '@/types';
import { isAfter, isBefore, isToday, startOfDay, endOfDay, addDays } from 'date-fns';

const TaskList: React.FC = () => {
  const { tasks } = useTaskStore();
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'none'>('all');

  const filteredTasks = tasks.filter((task) => {
    // First check if we should show completed tasks
    if (!showCompleted && task.completed) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    
    // Apply priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // Apply due date filter
    if (dueDateFilter !== 'all') {
      const now = new Date();
      const today = startOfDay(now);
      const tomorrow = startOfDay(addDays(now, 1));
      
      switch (dueDateFilter) {
        case 'overdue':
          // Show tasks that are overdue (due date is before today)
          return task.dueDate && isBefore(task.dueDate, today) && !task.completed;
        
        case 'today':
          // Show tasks due today
          return task.dueDate && isToday(task.dueDate);
        
        case 'upcoming':
          // Show tasks due in the future (after today)
          return task.dueDate && isAfter(task.dueDate, today);
        
        case 'none':
          // Show tasks with no due date
          return !task.dueDate;
      }
    }
    
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-8">
        <TaskForm />
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
        <TaskFilters
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
        />
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
