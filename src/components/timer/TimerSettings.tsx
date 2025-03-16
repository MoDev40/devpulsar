
import React from 'react';
import { X } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { useTimerStore } from '@/store/timerStore';

interface TimerSettingsProps {
  onClose: () => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = useTimerStore();
  
  const [workDuration, setWorkDuration] = React.useState(settings.workDuration);
  const [breakDuration, setBreakDuration] = React.useState(settings.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = React.useState(settings.longBreakDuration);
  const [longBreakInterval, setLongBreakInterval] = React.useState(settings.longBreakInterval);
  
  const handleSaveSettings = () => {
    updateSettings({
      workDuration,
      breakDuration,
      longBreakDuration,
      longBreakInterval,
    });
    onClose();
  };
  
  return (
    <div className="mb-8 glass-card p-6 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Timer Settings</h3>
        <CustomButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </CustomButton>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-2">Work Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
            className="w-full p-2 border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Break Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            className="w-full p-2 border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Long Break Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={longBreakDuration}
            onChange={(e) => setLongBreakDuration(Number(e.target.value))}
            className="w-full p-2 border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Long Break After (sessions)</label>
          <input
            type="number"
            min="1"
            max="10"
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(Number(e.target.value))}
            className="w-full p-2 border border-input rounded-md"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <CustomButton
          variant="default"
          onClick={handleSaveSettings}
        >
          Save Settings
        </CustomButton>
      </div>
    </div>
  );
};

export default TimerSettings;
