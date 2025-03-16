
import { create } from 'zustand';
import { TimerMode, TimerState } from '@/types';
import { TimerStore, defaultSettings } from './timerTypes';
import { createTimerActions } from './timerActions';
import { createAudioElement, loadTimerState } from './timerUtils';

// Load saved state from localStorage if available
const savedState = loadTimerState();

// Initial state for the timer
const initialState: TimerState = savedState || {
  mode: 'pomodoro',
  isRunning: false,
  isPaused: false,
  currentSession: 'work',
  timeRemaining: defaultSettings.workDuration * 60, // in seconds
  progress: 0,
  completedSessions: 0,
  settings: defaultSettings,
};

// Timer reference for interval
const timerRef: { current: number | null } = { current: null };

// Create audio element for notifications
const audioElement = createAudioElement();

// Create the timer store
export const useTimerStore = create<TimerStore>((set, get) => {
  return {
    ...initialState,
    ...createTimerActions(set, get, audioElement, timerRef),
  };
});

// Cleanup function to be called when the app unmounts
export const cleanupTimerStore = () => {
  const { isRunning } = useTimerStore.getState();
  
  if (isRunning) {
    // This ensures the timer interval is cleared when the app unmounts
    useTimerStore.getState().pauseTimer();
  }
};

export * from './timerTypes';
