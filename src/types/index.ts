
export type TaskCategory = 'bug' | 'feature' | 'enhancement' | 'documentation' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  createdAt: Date;
  github_issue_url?: string;
}

export type TimerMode = 'pomodoro' | 'progress';

export interface TimerSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many work sessions
}

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  currentSession: 'work' | 'break' | 'longBreak';
  timeRemaining: number; // in seconds
  progress: number; // 0 to 1
  completedSessions: number;
  settings: TimerSettings;
}

export interface GitHubConnection {
  id: string;
  github_username: string;
  created_at: Date;
  updated_at: Date;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  html_url: string;
  description: string | null;
  is_private: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubTrackingPreference {
  id: string;
  repo_id: number;
  repo_owner: string;
  repo_name: string;
  track_issues: boolean;
  track_pull_requests: boolean;
}
