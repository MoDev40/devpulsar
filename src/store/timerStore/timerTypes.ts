
import { TimerMode, TimerSettings, TimerState } from '@/types';

// Timer store actions interface
export interface TimerStore extends TimerState {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  setTimerMode: (mode: TimerMode) => void;
}

// Default timer settings
export const defaultSettings: TimerSettings = {
  workDuration: 25, // 25 minutes
  breakDuration: 5, // 5 minutes
  longBreakDuration: 15, // 15 minutes
  longBreakInterval: 4, // after 4 pomodoros
};
