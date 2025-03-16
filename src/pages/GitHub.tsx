
import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import GitHubConnect from '@/components/github/GitHubConnect';
import GitHubRepositoryList from '@/components/github/GitHubRepositoryList';
import GitHubIssueList from '@/components/github/GitHubIssueList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GitHub: React.FC = () => {
  const { isConnected, selectedRepository } = useGitHubStore();
  const [activeTab, setActiveTab] = useState('repositories');
  
  useEffect(() => {
    if (selectedRepository) {
      setActiveTab('issues');
    }
  }, [selectedRepository]);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">GitHub Integration</h1>
      
      {!isConnected ? (
        <GitHubConnect />
      ) : (
        <>
          <div className="mb-6">
            <GitHubConnect />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="issues" disabled={!selectedRepository}>Issues</TabsTrigger>
            </TabsList>
            <TabsContent value="repositories" className="mt-6">
              <GitHubRepositoryList />
            </TabsContent>
            <TabsContent value="issues" className="mt-6">
              <GitHubIssueList />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GitHub;
