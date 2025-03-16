
import { create } from 'zustand';
import { GitHubStore, GitHubState } from './githubTypes';
import { createGitHubActions } from './githubActions';

// Initial state
const initialState: GitHubState = {
  isConnected: false,
  connection: null,
  repositories: [],
  trackedRepositories: [],
  selectedRepository: null,
  issues: [],
  loading: false,
  error: null
};

// Create the GitHub store
export const useGitHubStore = create<GitHubStore>((set, get) => {
  return {
    ...initialState,
    ...createGitHubActions(set, get),
  };
});

export * from './githubTypes';
