
import { GitHubConnection, GitHubRepository, GitHubIssue, GitHubTrackingPreference } from '@/types';

export interface GitHubState {
  isConnected: boolean;
  connection: GitHubConnection | null;
  repositories: GitHubRepository[];
  trackedRepositories: GitHubTrackingPreference[];
  selectedRepository: GitHubRepository | null;
  issues: GitHubIssue[];
  loading: boolean;
  error: string | null;
}

export interface GitHubStore extends GitHubState {
  // Actions
  connectGitHub: () => Promise<void>;
  handleGitHubCallback: (code: string) => Promise<any>;
  fetchRepositories: () => Promise<void>;
  fetchTrackedRepositories: () => Promise<void>;
  trackRepository: (repository: GitHubRepository, trackIssues: boolean, trackPullRequests: boolean) => Promise<void>;
  selectRepository: (repository: GitHubRepository | null) => void;
  fetchIssues: (owner: string, repo: string) => Promise<void>;
  createTaskFromIssue: (issue: GitHubIssue, category: string, priority: string) => Promise<void>;
  disconnectGitHub: () => Promise<void>;
}
