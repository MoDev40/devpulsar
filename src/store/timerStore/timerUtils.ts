
import { toast } from 'sonner';
import { TimerState } from '@/types';

// Load saved state from localStorage if available
export const loadTimerState = (): TimerState | null => {
  if (typeof window === 'undefined') return null;
  
  const savedState = localStorage.getItem('timerState');
  return savedState ? JSON.parse(savedState) : null;
};

// Save state to localStorage
export const saveTimerState = (state: TimerState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('timerState', JSON.stringify(state));
  }
};

// Initialize audio for timer notifications
export const createAudioElement = (): HTMLAudioElement | null => {
  if (typeof window !== 'undefined') {
    return new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  }
  return null;
};

// Format time as mm:ss
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate total duration for current session in seconds
export const calculateSessionDuration = (
  currentSession: 'work' | 'break' | 'longBreak',
  settings: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
  }
): number => {
  return currentSession === 'work'
    ? settings.workDuration * 60
    : currentSession === 'break'
      ? settings.breakDuration * 60
      : settings.longBreakDuration * 60;
};

// Determine next session type
export const getNextSession = (
  currentSession: 'work' | 'break' | 'longBreak',
  completedSessions: number,
  longBreakInterval: number
): { 
  nextSession: 'work' | 'break' | 'longBreak'; 
  updatedCompletedSessions: number;
} => {
  let updatedCompletedSessions = completedSessions;
  let nextSession: 'work' | 'break' | 'longBreak';
  
  if (currentSession === 'work') {
    // If we complete a work session, increment counter
    updatedCompletedSessions += 1;
    
    // Check if it's time for a long break
    if (updatedCompletedSessions % longBreakInterval === 0) {
      nextSession = 'longBreak';
      toast.info('Time for a long break!');
    } else {
      nextSession = 'break';
      toast.info('Time for a short break!');
    }
  } else {
    // After any type of break, go back to work
    nextSession = 'work';
    toast.info('Back to work!');
  }
  
  return { nextSession, updatedCompletedSessions };
};
