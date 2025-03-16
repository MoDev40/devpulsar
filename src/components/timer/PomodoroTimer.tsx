
import React, { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';
import TimerControls from './TimerControls';
import { formatTime } from '@/store/timerStore/timerUtils';

const PomodoroTimer: React.FC = () => {
  const { 
    timeRemaining, 
    progress, 
    currentSession, 
    completedSessions 
  } = useTimerStore();
  
  // Calculate stroke dash offset for the progress ring
  const calculateStrokeDashOffset = (progress: number) => {
    const circumference = 2 * Math.PI * 120; // 2πr where r=120
    return circumference * (1 - progress);
  };
  
  // Determine session color
  const sessionColor = 
    currentSession === 'work'
      ? 'hsl(var(--primary))'
      : currentSession === 'break'
        ? 'hsl(var(--accent-foreground))'
        : 'hsl(143, 85%, 53%)'; // Green for long break
  
  // Determine session label
  const sessionLabel = 
    currentSession === 'work'
      ? 'Work Session'
      : currentSession === 'break'
        ? 'Short Break'
        : 'Long Break';
  
  // Update document title with timer
  useEffect(() => {
    document.title = `${formatTime(timeRemaining)} - ${sessionLabel}`;
    
    return () => {
      document.title = 'DevPulsar';
    };
  }, [timeRemaining, sessionLabel]);
  
  return (
    <div className="timer-card max-w-md mx-auto w-full animate-fade-in">
      <div className="mb-4 flex items-center justify-center">
        <span className="px-3 py-1 text-sm rounded-full bg-muted">{sessionLabel}</span>
      </div>
      
      <div className="relative flex items-center justify-center mb-6">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={sessionColor}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={calculateStrokeDashOffset(progress)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="timer-display">{formatTime(timeRemaining)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {completedSessions} sessions completed
          </div>
        </div>
      </div>
      
      <TimerControls />
    </div>
  );
};

export default PomodoroTimer;
