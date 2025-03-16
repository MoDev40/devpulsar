
import { TimerStore } from './timerTypes';
import { 
  calculateSessionDuration, 
  getNextSession, 
  saveTimerState 
} from './timerUtils';
import { toast } from 'sonner';

// Timer actions for the Zustand store
export const createTimerActions = (
  set: (state: Partial<TimerStore>) => void,
  get: () => TimerStore,
  audioElement: HTMLAudioElement | null,
  timerRef: { current: number | null }
) => ({
  startTimer: () => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      const state = get();
      if (!state.isRunning || state.isPaused) return;
      
      // Calculate new time remaining
      const newTimeRemaining = state.timeRemaining - 1;
      
      // Calculate total session duration
      const totalDuration = calculateSessionDuration(
        state.currentSession,
        state.settings
      );
      
      // Calculate progress
      const newProgress = 1 - (newTimeRemaining / totalDuration);
      
      // Check if timer has ended
      if (newTimeRemaining <= 0) {
        // Play sound
        if (audioElement) {
          audioElement.play().catch(error => console.error('Error playing sound:', error));
        }
        
        // Determine next session
        const { nextSession, updatedCompletedSessions } = getNextSession(
          state.currentSession,
          state.completedSessions,
          state.settings.longBreakInterval
        );
        
        // Calculate new time remaining based on next session
        const nextTimeRemaining = calculateSessionDuration(
          nextSession,
          state.settings
        );
        
        set({
          currentSession: nextSession,
          timeRemaining: nextTimeRemaining,
          progress: 0,
          completedSessions: updatedCompletedSessions,
        });
      } else {
        set({
          timeRemaining: newTimeRemaining,
          progress: newProgress,
        });
      }
    }, 1000);
    
    const newState = { isRunning: true, isPaused: false };
    set(newState);
    saveTimerState({ ...get(), ...newState });
  },
  
  pauseTimer: () => {
    const state = get();
    const isPaused = !state.isPaused;
    
    // If pausing, clear interval
    if (isPaused && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    } 
    // If resuming, start new interval
    else if (!isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      get().startTimer();
      return; // startTimer already updates state
    }
    
    const newState = { isPaused };
    set(newState);
    saveTimerState({ ...state, ...newState });
  },
  
  resetTimer: () => {
    const state = get();
    
    // Clear interval if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const initialDuration = calculateSessionDuration(
      state.currentSession,
      state.settings
    );
    
    const newState = {
      isRunning: false,
      isPaused: false,
      timeRemaining: initialDuration,
      progress: 0,
    };
    
    set(newState);
    saveTimerState({ ...state, ...newState });
  },
  
  skipSession: () => {
    const state = get();
    
    // Clear interval if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const { nextSession, updatedCompletedSessions } = getNextSession(
      state.currentSession,
      state.completedSessions,
      state.settings.longBreakInterval
    );
    
    const nextTimeRemaining = calculateSessionDuration(
      nextSession,
      state.settings
    );
    
    const newState = {
      currentSession: nextSession,
      timeRemaining: nextTimeRemaining,
      progress: 0,
      completedSessions: updatedCompletedSessions,
      isRunning: false,
      isPaused: false,
    };
    
    set(newState);
    saveTimerState({ ...state, ...newState });
    
    toast.info(`Skipped to ${nextSession} session`);
  },
  
  updateSettings: (settings: Partial<{ 
    workDuration: number; 
    breakDuration: number; 
    longBreakDuration: number; 
    longBreakInterval: number; 
  }>) => {
    const state = get();
    
    // Clear interval if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const newSettings = { ...state.settings, ...settings };
    
    // Recalculate timeRemaining based on current session and new settings
    const newTimeRemaining = calculateSessionDuration(
      state.currentSession,
      newSettings
    );
    
    const newState = {
      settings: newSettings,
      timeRemaining: newTimeRemaining,
      isRunning: false,
      isPaused: false,
      progress: 0,
    };
    
    set(newState);
    saveTimerState({ ...state, ...newState });
    
    toast.success('Timer settings updated');
  },
  
  setTimerMode: (mode: 'pomodoro' | 'progress') => {
    const state = get();
    
    // Clear interval if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const newState = {
      mode,
      isRunning: false,
      isPaused: false,
    };
    
    set(newState);
    saveTimerState({ ...state, ...newState });
  },
});
