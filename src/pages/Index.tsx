
import React, { useState } from 'react';
import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import TimerContainer from '@/components/TimerContainer';
import { TaskProvider } from '@/context/TaskContext';
import { TimerProvider } from '@/context/TimerContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'timer'>('tasks');

  return (
    <TaskProvider>
      <TimerProvider>
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
      </TimerProvider>
    </TaskProvider>
  );
};

export default Index;
