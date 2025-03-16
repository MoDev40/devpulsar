
import React from 'react';
import { X } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';

interface TimerHelpProps {
  onClose: () => void;
}

const TimerHelp: React.FC<TimerHelpProps> = ({ onClose }) => {
  return (
    <div className="mb-8 glass-card p-6 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Timer Help</h3>
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </CustomButton>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Pomodoro Timer</h4>
          <p className="text-sm text-muted-foreground">
            The Pomodoro Technique uses timed work sessions followed by short breaks to improve productivity. 
            After a set number of work sessions, take a longer break.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Progress Timer</h4>
          <p className="text-sm text-muted-foreground">
            A simple countdown timer with a visual progress bar. Set your desired work duration and focus until completion.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Controls</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Start/Pause: Begin or pause the current timer session</li>
            <li>Reset: Reset the current timer session</li>
            <li>Skip: Skip to the next session (e.g., from work to break)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimerHelp;
