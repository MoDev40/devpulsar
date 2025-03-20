
import React, { useState, useEffect } from 'react';
import Header from '@/components/navigation/Header';
import TaskList from '@/components/tasks/TaskList';
import TimerContainer from '@/components/timer/TimerContainer';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'timer'>('tasks');
  const { user } = useAuthStore();
  const { loadTasks, subscribeToTasks, unsubscribeFromTasks } = useTaskStore();

  // Load tasks and subscribe to real-time updates
  useEffect(() => {
    if (user) {
      loadTasks();
      subscribeToTasks();
      
      // Cleanup subscription when component unmounts
      return () => {
        unsubscribeFromTasks();
      };
    }
  }, [user, loadTasks, subscribeToTasks, unsubscribeFromTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {activeTab === 'tasks' ? (
          <TaskList />
        ) : (
          <TimerContainer />
        )}
      </main>
    </div>
  );
};

export default Index;
