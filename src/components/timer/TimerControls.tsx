
import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { useTimerStore } from '@/store/timerStore';

const TimerControls: React.FC = () => {
  const { isRunning, isPaused, startTimer, pauseTimer, resetTimer, skipSession } = useTimerStore();
  
  return (
    <div className="flex justify-center space-x-2 mt-8">
      {!isRunning ? (
        <CustomButton
          variant="default"
          size="lg"
          onClick={startTimer}
          className="flex items-center"
        >
          <Play className="w-5 h-5 mr-2" />
          Start
        </CustomButton>
      ) : (
        <CustomButton
          variant={isPaused ? "outline" : "default"}
          size="lg"
          onClick={pauseTimer}
          className="flex items-center"
        >
          <Pause className="w-5 h-5 mr-2" />
          {isPaused ? "Resume" : "Pause"}
        </CustomButton>
      )}
      
      <CustomButton
        variant="outline"
        size="icon"
        onClick={resetTimer}
        className="flex items-center justify-center"
      >
        <RotateCcw className="w-5 h-5" />
      </CustomButton>
      
      <CustomButton
        variant="outline"
        size="icon"
        onClick={skipSession}
        className="flex items-center justify-center"
      >
        <SkipForward className="w-5 h-5" />
      </CustomButton>
    </div>
  );
};

export default TimerControls;
