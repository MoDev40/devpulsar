
import React, { useState } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import TimerContainer from '@/components/TimerContainer';
import { TaskProvider } from '@/context/TaskContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'timer'>('tasks');

  return (
    <TaskProvider>
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
    </TaskProvider>
  );
};

export default Index;
