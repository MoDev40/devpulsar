
export type TaskCategory = 'bug' | 'feature' | 'enhancement' | 'documentation' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskTag = string;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  createdAt: Date;
  dueDate?: Date | null; // Optional due date
  tags?: TaskTag[]; // Optional tags for categorization
  sharedWith?: string[]; // Optional list of user IDs the task is shared with
  reminder?: Date | null; // Optional reminder date/time
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
