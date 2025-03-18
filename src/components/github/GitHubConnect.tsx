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

      // Set a loading flag or something similar
      setCallbackProcessing(true);

      if (savedState === null) {
        console.error(
          "State was not saved in localStorage. Possible issue with initial OAuth flow."
        );
        toast.error("Error: State not saved. Please try again.");
        setCallbackProcessing(false);
        return;
      }

      if (state === savedState) {
        // Exchange the code for an access token
        handleGitHubCallback(code);
      } else {
        console.error("State mismatch in GitHub callback", {
          state,
          savedState,
        });
        toast.error("Invalid authentication state. Please try again.");
        setCallbackProcessing(false);
      }

      // Clear URL parameters (to prevent re-triggering)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Dependency array left empty to only run once on component mount

  const handleGitHubCallback = async (code: string) => {
    try {
      console.log("Exchanging GitHub code for token");

      // Call the Supabase function to exchange code for token
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: { code, action: "exchange" },
      });

      if (error) {
        // If there's an error in the Supabase function, log it and show an error toast
        console.error("GitHub callback error:", error);
        toast.error(
          `Failed to connect GitHub account: ${error.message || error}`
        );
        throw new Error(error.message || "Unknown error");
      }

      console.log("GitHub token exchange successful:", data);

      // Show success message
      toast.success("GitHub account connected successfully!");

      // Optionally, update state or perform any necessary UI updates here
      // This avoids a full page reload
    } catch (error) {
      // Handle any unexpected errors here
      console.error("Unexpected GitHub callback error:", error);
      toast.error("Failed to connect GitHub account. Please try again.");
    } finally {
      setCallbackProcessing(false); // Stop loading indicator
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
        {loading || callbackProcessing
          ? "Connecting..."
          : "Connect GitHub Account"}
      </CustomButton>
    </div>
  );
};

export default GitHubConnect;
