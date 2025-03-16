
import React, { useEffect } from 'react';
import { useGitHubStore } from '@/store/githubStore';
import { CustomButton } from '@/components/ui/custom-button';
import { Github } from 'lucide-react';

const GitHubConnect: React.FC = () => {
  const { isConnected, connection, loading, connectGitHub } = useGitHubStore();

  useEffect(() => {
    // Check URL for GitHub callback
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (code && state) {
      // Verify state to prevent CSRF attacks
      const savedState = localStorage.getItem('github_oauth_state');
      
      if (state === savedState) {
        // Exchange the code for an access token
        handleGitHubCallback(code);
      }
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGitHubCallback = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth', {
        body: { code, action: 'exchange' },
      });
      
      if (error) throw error;
      
      // Refresh the page to update the GitHub connection state
      window.location.reload();
    } catch (error) {
      console.error('GitHub callback error:', error);
    }
  };

  if (isConnected && connection) {
    return (
      <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg">
        <Github className="h-5 w-5" />
        <span>Connected to GitHub as <strong>{connection.github_username}</strong></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-secondary/10 rounded-lg text-center space-y-4">
      <h3 className="text-lg font-medium">Connect with GitHub</h3>
      <p className="text-muted-foreground">
        Link your GitHub account to track issues and pull requests
      </p>
      <CustomButton 
        onClick={connectGitHub} 
        disabled={loading}
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        {loading ? 'Connecting...' : 'Connect GitHub Account'}
      </CustomButton>
    </div>
  );
};

export default GitHubConnect;
