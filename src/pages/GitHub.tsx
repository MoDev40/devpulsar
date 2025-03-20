
import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import GitHubConnect from '@/components/github/GitHubConnect';
import GitHubRepositoryList from '@/components/github/GitHubRepositoryList';
import GitHubIssueList from '@/components/github/GitHubIssueList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const GitHub: React.FC = () => {
  const { isConnected, selectedRepository, handleGitHubCallback } = useGitHubStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('repositories');
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
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
      setOauthError(`${errorDescription || error}`);
      toast.error(`GitHub OAuth error: ${errorDescription || error}`);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem("github_oauth_state");
      return;
    }
    
    if (code && state && !processingOAuth) {
      console.log("OAuth callback detected, processing...");
      setProcessingOAuth(true);
      setOauthError(null);
      
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
            const errorMessage = error.message || String(error);
            setOauthError(errorMessage);
            toast.error(`Failed to connect GitHub account: ${errorMessage}`);
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
        setOauthError("Invalid authentication state. Please try again.");
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
  
  // Add environment variables check on page load
  useEffect(() => {
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      console.warn("GitHub client ID is not configured in environment variables");
      toast.warning("GitHub OAuth is not fully configured. Please set VITE_GITHUB_CLIENT_ID environment variable.");
    }
    
    // Log all environment variables for debugging
    console.info("Environment variables in App:", {
      NODE_ENV: import.meta.env.NODE_ENV,
      VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID ? "set" : "not set",
      VITE_GITHUB_REDIRECT_URI: import.meta.env.VITE_GITHUB_REDIRECT_URI ? "set" : "not set",
      BASE_URL: import.meta.env.BASE_URL,
      AUTH_STATE: localStorage.getItem("github_oauth_state"),
      FULL_URL: window.location.href,
      SEARCH_PARAMS: window.location.search,
    });
  }, []);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">GitHub Integration</h1>
      
      {processingOAuth && (
        <div className="mb-6 p-4 bg-secondary/20 rounded-lg text-center">
          <p>Processing GitHub authorization...</p>
        </div>
      )}
      
      {oauthError && (
        <div className="mb-6 p-4 bg-destructive/20 border border-destructive rounded-lg">
          <h3 className="font-medium text-destructive mb-2">GitHub Connection Error</h3>
          <p className="text-destructive-foreground">{oauthError}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Please check that your GitHub OAuth app settings include the redirect URI: 
            <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">
              {window.location.origin}/github
            </code>
          </p>
        </div>
      )}
      
      {!user && !isConnected && (
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Anonymous GitHub Access</h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            You are not logged in. You can still connect to GitHub, but your connection will not be saved 
            between sessions. Some features may be limited.
          </p>
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
