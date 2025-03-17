
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

    if (code && state) {
      // Verify state to prevent CSRF attacks
      const savedState = localStorage.getItem("github_oauth_state");
      
      console.log("GitHub callback detected:", { code, state, savedState });
      setCallbackProcessing(true);

      if (state === savedState) {
        // Exchange the code for an access token
        handleGitHubCallback(code);
      } else {
        console.error("State mismatch in GitHub callback", { state, savedState });
        toast.error("Invalid authentication state. Please try again.");
        setCallbackProcessing(false);
      }

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGitHubCallback = async (code: string) => {
    try {
      console.log("Exchanging GitHub code for token");
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: { code, action: "exchange" },
      });

      if (error) {
        console.error("GitHub callback error:", error);
        toast.error("Failed to connect GitHub account. Please try again.");
        throw error;
      }

      console.log("GitHub token exchange successful:", data);
      toast.success("GitHub account connected successfully!");
      
      // Refresh the page to update the GitHub connection state
      window.location.reload();
    } catch (error) {
      console.error("GitHub callback error:", error);
      toast.error("Failed to connect GitHub account. Please try again.");
    } finally {
      setCallbackProcessing(false);
    }
  };

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
        disabled={loading || callbackProcessing}
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        {loading || callbackProcessing ? "Connecting..." : "Connect GitHub Account"}
      </CustomButton>
    </div>
  );
};

export default GitHubConnect;
