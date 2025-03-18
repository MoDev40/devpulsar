
import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import GitHubConnect from '@/components/github/GitHubConnect';
import GitHubRepositoryList from '@/components/github/GitHubRepositoryList';
import GitHubIssueList from '@/components/github/GitHubIssueList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const GitHub: React.FC = () => {
  const { isConnected, selectedRepository, handleGitHubCallback } = useGitHubStore();
  const [activeTab, setActiveTab] = useState('repositories');
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const location = useLocation();
  
  // Process OAuth redirect if necessary
  useEffect(() => {
    // If we have code and state in the URL, it means we're in an OAuth callback
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error("GitHub OAuth error:", error, errorDescription);
      toast.error(`GitHub OAuth error: ${errorDescription || error}`);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem("github_oauth_state");
      return;
    }
    
    if (code && state && !processingOAuth) {
      console.log("OAuth callback detected, processing...");
      setProcessingOAuth(true);
      
      // Verify state to prevent CSRF attacks
      const savedState = localStorage.getItem("github_oauth_state");
      console.log("State validation:", { receivedState: state, savedState });
      
      if (state === savedState) {
        // Pass the code to our GitHub store handler
        handleGitHubCallback(code)
          .then(() => {
            console.log("GitHub callback processed successfully");
            toast.success("GitHub account connected successfully!");
          })
          .catch((error) => {
            console.error("Error processing GitHub callback:", error);
            toast.error(`Failed to connect GitHub account: ${error.message || error}`);
          })
          .finally(() => {
            setProcessingOAuth(false);
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear state from localStorage
            localStorage.removeItem("github_oauth_state");
          });
      } else {
        console.error("State mismatch in GitHub callback", {
          receivedState: state,
          savedState,
        });
        toast.error("Invalid authentication state. Please try again.");
        setProcessingOAuth(false);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem("github_oauth_state");
      }
    }
  }, [location, handleGitHubCallback, processingOAuth]);
  
  useEffect(() => {
    if (selectedRepository) {
      setActiveTab('issues');
    }
  }, [selectedRepository]);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">GitHub Integration</h1>
      
      {processingOAuth && (
        <div className="mb-6 p-4 bg-secondary/20 rounded-lg text-center">
          <p>Processing GitHub authorization...</p>
        </div>
      )}
      
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
