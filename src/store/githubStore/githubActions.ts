
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import {
  GitHubRepository,
  GitHubIssue,
  TaskCategory,
  TaskPriority,
} from "@/types";
import { GitHubStore } from "./githubTypes";
import { useTaskStore } from "@/store/taskStore";

export const createGitHubActions = (
  set: (
    state: Partial<GitHubStore> | ((state: GitHubStore) => Partial<GitHubStore>)
  ) => void,
  get: () => GitHubStore
) => {
  return {
    connectGitHub: async () => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to connect GitHub");
        return;
      }

      set({ loading: true, error: null });

      try {
        // First check if the user already has a GitHub connection
        const { data: existingConnection } = await supabase
          .from("github_connections")
          .select("id, github_username, created_at, updated_at")
          .eq("user_id", user.id)
          .single();

        if (existingConnection) {
          set({
            isConnected: true,
            connection: {
              id: existingConnection.id,
              github_username: existingConnection.github_username,
              created_at: new Date(existingConnection.created_at),
              updated_at: new Date(existingConnection.updated_at),
            },
            loading: false,
          });
          return;
        }

        // Generate a random state value for security
        const state = Math.random().toString(36).substring(2, 15);
        
        // Clear any previous state before setting a new one
        localStorage.removeItem("github_oauth_state");
        localStorage.setItem("github_oauth_state", state);

        // Get GitHub client ID from environment variables
        const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

        // Check if GitHub client ID is available
        if (!githubClientId) {
          console.error(
            "GitHub client ID is not defined in environment variables"
          );
          set({ error: "GitHub client ID is not configured", loading: false });
          toast.error(
            "GitHub integration is not properly configured. Please check your environment variables."
          );
          return;
        }

        // Use the configured redirect URI, or default to current origin
        const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/github`;
        const scope = "repo";

        console.log("OAuth configuration:", {
          clientId: githubClientId,
          redirectUri,
          state,
          currentPath: window.location.pathname,
        });

        // Generate GitHub OAuth URL with proper URL encoding
        const githubUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
          githubClientId
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(
          state
        )}`;

        console.log("Redirecting to GitHub OAuth URL:", githubUrl);

        // Redirect to GitHub for authorization
        window.location.href = githubUrl;
      } catch (error: any) {
        console.error("GitHub connect error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to connect to GitHub");
      }
    },

    fetchRepositories: async () => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to fetch repositories");
        return;
      }

      set({ loading: true, error: null });

      try {
        // Call our Supabase Edge Function to fetch the repositories
        const { data, error } = await supabase.functions.invoke(
          "github-oauth",
          {
            body: { action: "repositories" },
          }
        );

        if (error) throw error;

        set({ repositories: data.repositories, loading: false });
      } catch (error: any) {
        console.error("Fetch repositories error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to fetch GitHub repositories");
      }
    },

    fetchTrackedRepositories: async () => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to fetch tracked repositories");
        return;
      }

      set({ loading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("github_repos")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        set({
          trackedRepositories: data.map((repo) => ({
            id: repo.id,
            repo_id: repo.repo_id,
            repo_owner: repo.repo_owner,
            repo_name: repo.repo_name,
            track_issues: repo.track_issues,
            track_pull_requests: repo.track_pull_requests,
          })),
          loading: false,
        });
      } catch (error: any) {
        console.error("Fetch tracked repositories error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to fetch tracked repositories");
      }
    },

    trackRepository: async (
      repository: GitHubRepository,
      trackIssues: boolean,
      trackPullRequests: boolean
    ) => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to track repositories");
        return;
      }

      set({ loading: true, error: null });

      try {
        // Call our Supabase Edge Function to track the repository
        const { data, error } = await supabase.functions.invoke(
          "github-oauth",
          {
            body: {
              action: "track",
              repo_id: repository.id,
              repo_owner: repository.owner,
              repo_name: repository.name,
              track_issues: trackIssues,
              track_pull_requests: trackPullRequests,
            },
          }
        );

        if (error) throw error;

        // Update the tracked repositories list
        await get().fetchTrackedRepositories();

        toast.success(`Now tracking ${repository.full_name}`);
      } catch (error: any) {
        console.error("Track repository error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to track repository");
      }
    },

    selectRepository: (repository: GitHubRepository | null) => {
      set({ selectedRepository: repository });
      if (repository) {
        get().fetchIssues(repository.owner, repository.name);
      } else {
        set({ issues: [] });
      }
    },

    fetchIssues: async (owner: string, repo: string) => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to fetch issues");
        return;
      }

      set({ loading: true, error: null });

      try {
        // Call our Supabase Edge Function to fetch the issues
        const { data, error } = await supabase.functions.invoke(
          "github-oauth",
          {
            body: {
              action: "issues",
              repo_owner: owner,
              repo_name: repo,
            },
          }
        );

        if (error) throw error;

        set({ issues: data.issues, loading: false });
      } catch (error: any) {
        console.error("Fetch issues error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to fetch GitHub issues");
      }
    },

    createTaskFromIssue: async (
      issue: GitHubIssue,
      category: string,
      priority: string
    ) => {
      const { addTask } = useTaskStore.getState();

      try {
        await addTask(
          `GitHub Issue #${issue.number}: ${issue.title}`,
          category as TaskCategory,
          priority as TaskPriority,
          issue.html_url
        );

        toast.success("Task created from GitHub issue");
      } catch (error: any) {
        console.error("Create task from issue error:", error);
        toast.error("Failed to create task from issue");
      }
    },

    disconnectGitHub: async () => {
      const { user } = useAuthStore.getState();

      if (!user) {
        toast.error("You must be logged in to disconnect GitHub");
        return;
      }

      set({ loading: true, error: null });

      try {
        // Delete the GitHub connection
        const { error } = await supabase
          .from("github_connections")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;

        // Reset the state
        set({
          isConnected: false,
          connection: null,
          repositories: [],
          trackedRepositories: [],
          selectedRepository: null,
          issues: [],
          loading: false,
        });

        toast.success("GitHub account disconnected");
      } catch (error: any) {
        console.error("Disconnect GitHub error:", error);
        set({ error: error.message, loading: false });
        toast.error("Failed to disconnect GitHub account");
      }
    },
  };
};
