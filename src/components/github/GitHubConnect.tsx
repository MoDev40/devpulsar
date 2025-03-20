
import React from "react";
import { useGitHubStore } from "@/store/githubStore";
import { CustomButton } from "@/components/ui/custom-button";
import { Github } from "lucide-react";

const GitHubConnect: React.FC = () => {
  const { isConnected, connection, loading, connectGitHub, disconnectGitHub } = useGitHubStore();

  const handleConnect = () => {
    // Generate a new state parameter for this connection attempt
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store the state in localStorage to verify during callback
    // This is critical for security to prevent CSRF attacks
    localStorage.setItem("github_oauth_state", state);
    console.log("Setting OAuth state in localStorage:", state);
    
    // Get the current URL base to use for redirect
    const redirectUri = `${window.location.origin}/github`;
    
    connectGitHub(state, redirectUri);
  };

  if (isConnected && connection) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-secondary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <span>
            Connected to GitHub as <strong>{connection.github_username}</strong>
          </span>
        </div>
        <div className="ml-auto mt-2 sm:mt-0">
          <CustomButton 
            onClick={disconnectGitHub} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            Disconnect
          </CustomButton>
        </div>
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
        onClick={handleConnect}
        disabled={loading}
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        {loading ? "Connecting..." : "Connect GitHub Account"}
      </CustomButton>
    </div>
  );
};

export default GitHubConnect;
