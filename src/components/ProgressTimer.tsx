
import React, { useState, useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { Slider } from '@/components/ui/slider';
import TimerControls from './TimerControls';

const ProgressTimer: React.FC = () => {
  const { 
    timeRemaining, 
    progress, 
    isRunning, 
    settings, 
    updateSettings 
  } = useTimerStore();
  
  const [customDuration, setCustomDuration] = useState(settings.workDuration);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentage completed
  const percentComplete = Math.round(progress * 100);
  
  // Update custom duration for progress timer
  useEffect(() => {
    if (!isRunning) {
      updateSettings({ workDuration: customDuration });
    }
  }, [customDuration, isRunning, updateSettings]);
  
  // Update document title with timer
  useEffect(() => {
    document.title = `${formatTime(timeRemaining)} - ${percentComplete}%`;
    
    return () => {
      document.title = 'DevPulsar';
    };
  }, [timeRemaining, percentComplete]);
  
  const handleSliderChange = (value: number[]) => {
    setCustomDuration(value[0]);
  };
  
  return (
    <div className="timer-card max-w-md mx-auto w-full animate-fade-in">
      <div className="w-full flex flex-col items-center mb-6">
        <div className="text-center mb-8">
          <div className="timer-display mb-1">{formatTime(timeRemaining)}</div>
          <p className="text-muted-foreground">{percentComplete}% Complete</p>
        </div>
        
        <div className="timer-progress-bar w-full">
          <div
            className="timer-progress-bar-inner"
            style={{ 
              width: `${percentComplete}%`, 
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>
      
      {!isRunning && (
        <div className="mb-8 w-full px-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="text-sm font-medium">{customDuration} min</span>
          </div>
          <Slider
            value={[customDuration]}
            min={1}
            max={120}
            step={1}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
      )}
      
      <TimerControls />
    </div>
  );
};

export default ProgressTimer;
