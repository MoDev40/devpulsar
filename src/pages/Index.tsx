import React from 'react';
import TaskList from '@/components/tasks/TaskList';

const Index: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      <TaskList />
    </div>
  );
};

export default Index;
