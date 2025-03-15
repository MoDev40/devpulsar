import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerSettings, TimerState } from '@/types';
import { toast } from 'sonner';

interface TimerContextType {
  timerState: TimerState;
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

const defaultTimerState: TimerState = {
  mode: 'pomodoro',
  isRunning: false,
  isPaused: false,
  currentSession: 'work',
  timeRemaining: defaultSettings.workDuration * 60, // in seconds
  progress: 0,
  completedSessions: 0,
  settings: defaultSettings,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    // Initialize with localStorage or default
    const savedState = localStorage.getItem('timerState');
    return savedState ? JSON.parse(savedState) : defaultTimerState;
  });
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [timerState]);

  // Timer tick function
  const timerTick = useCallback(() => {
    setTimerState((prevState) => {
      if (!prevState.isRunning || prevState.isPaused) return prevState;
      
      // Calculate new time remaining
      const newTimeRemaining = prevState.timeRemaining - 1;
      
      // Calculate total session duration in seconds
      const totalDuration = 
        prevState.currentSession === 'work' 
          ? prevState.settings.workDuration * 60
          : prevState.currentSession === 'break'
            ? prevState.settings.breakDuration * 60
            : prevState.settings.longBreakDuration * 60;
      
      // Calculate progress
      const newProgress = 1 - (newTimeRemaining / totalDuration);
      
      // Check if timer has ended
      if (newTimeRemaining <= 0) {
        // Play sound
        if (audioRef.current) {
          audioRef.current.play().catch(error => console.error('Error playing sound:', error));
        }
        
        // Determine next session
        let nextSession: 'work' | 'break' | 'longBreak';
        let completedSessions = prevState.completedSessions;
        
        if (prevState.currentSession === 'work') {
          completedSessions += 1;
          
          // Check if it's time for a long break
          if (completedSessions % prevState.settings.longBreakInterval === 0) {
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
            ? prevState.settings.workDuration * 60
            : nextSession === 'break'
              ? prevState.settings.breakDuration * 60
              : prevState.settings.longBreakDuration * 60;
        
        return {
          ...prevState,
          currentSession: nextSession,
          timeRemaining: nextTimeRemaining,
          progress: 0,
          completedSessions,
        };
      }
      
      return {
        ...prevState,
        timeRemaining: newTimeRemaining,
        progress: newProgress,
      };
    });
  }, []);

  // Set up or clear timer
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      timerRef.current = window.setInterval(timerTick, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.isPaused, timerTick]);

  const startTimer = () => {
    setTimerState((prevState) => ({
      ...prevState,
      isRunning: true,
      isPaused: false,
    }));
  };

  const pauseTimer = () => {
    setTimerState((prevState) => ({
      ...prevState,
      isPaused: !prevState.isPaused,
    }));
  };

  const resetTimer = () => {
    const initialDuration = 
      timerState.currentSession === 'work' 
        ? timerState.settings.workDuration * 60
        : timerState.currentSession === 'break'
          ? timerState.settings.breakDuration * 60
          : timerState.settings.longBreakDuration * 60;
    
    setTimerState((prevState) => ({
      ...prevState,
      isRunning: false,
      isPaused: false,
      timeRemaining: initialDuration,
      progress: 0,
    }));
  };

  const skipSession = () => {
    let nextSession: 'work' | 'break' | 'longBreak';
    let completedSessions = timerState.completedSessions;
    
    if (timerState.currentSession === 'work') {
      completedSessions += 1;
      if (completedSessions % timerState.settings.longBreakInterval === 0) {
        nextSession = 'longBreak';
      } else {
        nextSession = 'break';
      }
    } else {
      nextSession = 'work';
    }
    
    const nextTimeRemaining = 
      nextSession === 'work' 
        ? timerState.settings.workDuration * 60
        : nextSession === 'break'
          ? timerState.settings.breakDuration * 60
          : timerState.settings.longBreakDuration * 60;
    
    setTimerState((prevState) => ({
      ...prevState,
      currentSession: nextSession,
      timeRemaining: nextTimeRemaining,
      progress: 0,
      completedSessions,
      isRunning: false,
      isPaused: false,
    }));
    
    toast.info(`Skipped to ${nextSession} session`);
  };

  const updateSettings = (settings: Partial<TimerSettings>) => {
    setTimerState((prevState) => {
      const newSettings = { ...prevState.settings, ...settings };
      
      // Recalculate timeRemaining based on the current session and new settings
      const newTimeRemaining = 
        prevState.currentSession === 'work' 
          ? newSettings.workDuration * 60
          : prevState.currentSession === 'break'
            ? newSettings.breakDuration * 60
            : newSettings.longBreakDuration * 60;
      
      return {
        ...prevState,
        settings: newSettings,
        timeRemaining: newTimeRemaining,
        isRunning: false,
        isPaused: false,
        progress: 0,
      };
    });
    
    toast.success('Timer settings updated');
  };

  const setTimerMode = (mode: TimerMode) => {
    setTimerState((prevState) => ({
      ...prevState,
      mode,
      isRunning: false,
      isPaused: false,
    }));
  };

  return (
    <TimerContext.Provider
      value={{
        timerState,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        updateSettings,
        setTimerMode,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
