
import React, { useEffect, useState } from "react";
import { useGitHubStore } from "@/store/githubStore";
import { CustomButton } from "@/components/ui/custom-button";
import { Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GitHubConnect: React.FC = () => {
  const { isConnected, connection, loading, connectGitHub } = useGitHubStore();
  const [callbackProcessing, setCallbackProcessing] = useState(false);

  useEffect(() => {
    // Check URL for GitHub callback
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    
    const processCallback = async (code: string, state: string) => {
      setCallbackProcessing(true);
      
      try {
        // Verify state to prevent CSRF attacks
        const savedState = localStorage.getItem("github_oauth_state");

        if (!savedState || state !== savedState) {
          throw new Error("Invalid state parameter. This could be a CSRF attack attempt.");
        }

        // Exchange the code for an access token
        await handleGitHubCallback(code);
        
        // Clear state from localStorage after use
        localStorage.removeItem("github_oauth_state");
      } catch (error: any) {
        console.error("GitHub callback error:", error);
        toast.error(error.message || "Failed to connect GitHub account");
      } finally {
        setCallbackProcessing(false);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    if (code && state) {
      processCallback(code, state);
    }
  }, []);

  const handleGitHubCallback = async (code: string) => {
    try {
      // Make sure the GitHub client ID is defined in environment variables
      if (!import.meta.env.VITE_GITHUB_CLIENT_ID) {
        throw new Error("GitHub Client ID is not configured");
      }
      
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: { code, action: "exchange" },
      });

      if (error) throw error;

      // Refresh the page to update the GitHub connection state
      window.location.reload();
    } catch (error: any) {
      console.error("GitHub callback error:", error);
      throw error;
    }
  };

  if (callbackProcessing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Connecting to GitHub...</span>
      </div>
    );
  }

  if (isConnected && connection) {
    return (
      <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-lg">
        <Github className="h-5 w-5" />
        <span>
          Connected to GitHub as <strong>{connection.github_username}</strong>
        </span>
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
        {loading ? "Connecting..." : "Connect GitHub Account"}
      </CustomButton>
      {!import.meta.env.VITE_GITHUB_CLIENT_ID && (
        <p className="text-destructive text-sm mt-2">
          GitHub Client ID is missing. Please make sure VITE_GITHUB_CLIENT_ID is set in your environment.
        </p>
      )}
    </div>
  );
};

export default GitHubConnect;
