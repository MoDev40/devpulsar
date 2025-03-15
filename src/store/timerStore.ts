
import { create } from 'zustand';
import { TimerMode, TimerSettings, TimerState } from '@/types';
import { toast } from 'sonner';

interface TimerStore extends TimerState {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  setTimerMode: (mode: TimerMode) => void;
}

const defaultSettings: TimerSettings = {
  workDuration: 25, // 25 minutes
  breakDuration: 5, // 5 minutes
  longBreakDuration: 15, // 15 minutes
  longBreakInterval: 4, // after 4 pomodoros
};

export const useTimerStore = create<TimerStore>((set, get) => {
  // Initialize audio element
  let audioElement: HTMLAudioElement | null = null;
  if (typeof window !== 'undefined') {
    audioElement = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  }

  // Load saved state from localStorage if available
  const savedState = typeof window !== 'undefined' 
    ? localStorage.getItem('timerState') 
    : null;
  
  const initialState: TimerState = savedState 
    ? JSON.parse(savedState) 
    : {
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
  let timerRef: number | null = null;

  // Timer tick function
  const timerTick = () => {
    const state = get();
    if (!state.isRunning || state.isPaused) return;
    
    // Calculate new time remaining
    const newTimeRemaining = state.timeRemaining - 1;
    
    // Calculate total session duration in seconds
    const totalDuration = 
      state.currentSession === 'work' 
        ? state.settings.workDuration * 60
        : state.currentSession === 'break'
          ? state.settings.breakDuration * 60
          : state.settings.longBreakDuration * 60;
    
    // Calculate progress
    const newProgress = 1 - (newTimeRemaining / totalDuration);
    
    // Check if timer has ended
    if (newTimeRemaining <= 0) {
      // Play sound
      if (audioElement) {
        audioElement.play().catch(error => console.error('Error playing sound:', error));
      }
      
      // Determine next session
      let nextSession: 'work' | 'break' | 'longBreak';
      let completedSessions = state.completedSessions;
      
      if (state.currentSession === 'work') {
        completedSessions += 1;
        
        // Check if it's time for a long break
        if (completedSessions % state.settings.longBreakInterval === 0) {
          nextSession = 'longBreak';
          toast.info('Time for a long break!');
        } else {
          nextSession = 'break';
          toast.info('Time for a short break!');
        }
      } else {
        nextSession = 'work';
        toast.info('Back to work!');
      }
      
      // Calculate new time remaining based on next session
      const nextTimeRemaining = 
        nextSession === 'work' 
          ? state.settings.workDuration * 60
          : nextSession === 'break'
            ? state.settings.breakDuration * 60
            : state.settings.longBreakDuration * 60;
      
      set({
        currentSession: nextSession,
        timeRemaining: nextTimeRemaining,
        progress: 0,
        completedSessions,
      });
    } else {
      set({
        timeRemaining: newTimeRemaining,
        progress: newProgress,
      });
    }
  };

  // Save state to localStorage whenever it changes
  const saveState = (state: TimerState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerState', JSON.stringify(state));
    }
  };

  return {
    ...initialState,
    
    startTimer: () => {
      // Clear existing timer if any
      if (timerRef) {
        clearInterval(timerRef);
      }
      
      // Start new timer
      timerRef = window.setInterval(timerTick, 1000);
      
      const newState = { isRunning: true, isPaused: false };
      set(newState);
      saveState({ ...get(), ...newState });
    },
    
    pauseTimer: () => {
      const state = get();
      const isPaused = !state.isPaused;
      
      // If pausing, clear interval
      if (isPaused && timerRef) {
        clearInterval(timerRef);
        timerRef = null;
      } 
      // If resuming, start new interval
      else if (!isPaused) {
        if (timerRef) clearInterval(timerRef);
        timerRef = window.setInterval(timerTick, 1000);
      }
      
      const newState = { isPaused };
      set(newState);
      saveState({ ...state, ...newState });
    },
    
    resetTimer: () => {
      const state = get();
      
      // Clear interval if running
      if (timerRef) {
        clearInterval(timerRef);
        timerRef = null;
      }
      
      const initialDuration = 
        state.currentSession === 'work' 
          ? state.settings.workDuration * 60
          : state.currentSession === 'break'
            ? state.settings.breakDuration * 60
            : state.settings.longBreakDuration * 60;
      
      const newState = {
        isRunning: false,
        isPaused: false,
        timeRemaining: initialDuration,
        progress: 0,
      };
      
      set(newState);
      saveState({ ...state, ...newState });
    },
    
    skipSession: () => {
      const state = get();
      
      // Clear interval if running
      if (timerRef) {
        clearInterval(timerRef);
        timerRef = null;
      }
      
      let nextSession: 'work' | 'break' | 'longBreak';
      let completedSessions = state.completedSessions;
      
      if (state.currentSession === 'work') {
        completedSessions += 1;
        if (completedSessions % state.settings.longBreakInterval === 0) {
          nextSession = 'longBreak';
        } else {
          nextSession = 'break';
        }
      } else {
        nextSession = 'work';
      }
      
      const nextTimeRemaining = 
        nextSession === 'work' 
          ? state.settings.workDuration * 60
          : nextSession === 'break'
            ? state.settings.breakDuration * 60
            : state.settings.longBreakDuration * 60;
      
      const newState = {
        currentSession: nextSession,
        timeRemaining: nextTimeRemaining,
        progress: 0,
        completedSessions,
        isRunning: false,
        isPaused: false,
      };
      
      set(newState);
      saveState({ ...state, ...newState });
      
      toast.info(`Skipped to ${nextSession} session`);
    },
    
    updateSettings: (settings: Partial<TimerSettings>) => {
      const state = get();
      
      // Clear interval if running
      if (timerRef) {
        clearInterval(timerRef);
        timerRef = null;
      }
      
      const newSettings = { ...state.settings, ...settings };
      
      // Recalculate timeRemaining based on the current session and new settings
      const newTimeRemaining = 
        state.currentSession === 'work' 
          ? newSettings.workDuration * 60
          : state.currentSession === 'break'
            ? newSettings.breakDuration * 60
            : newSettings.longBreakDuration * 60;
      
      const newState = {
        settings: newSettings,
        timeRemaining: newTimeRemaining,
        isRunning: false,
        isPaused: false,
        progress: 0,
      };
      
      set(newState);
      saveState({ ...state, ...newState });
      
      toast.success('Timer settings updated');
    },
    
    setTimerMode: (mode: TimerMode) => {
      const state = get();
      
      // Clear interval if running
      if (timerRef) {
        clearInterval(timerRef);
        timerRef = null;
      }
      
      const newState = {
        mode,
        isRunning: false,
        isPaused: false,
      };
      
      set(newState);
      saveState({ ...state, ...newState });
    },
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
