import React, { useState } from 'react';
import { useTimerStore } from '@/store/timerStore';
import PomodoroTimer from './PomodoroTimer';
import ProgressTimer from './ProgressTimer';
import { CustomButton } from '@/components/ui/custom-button';
import { Settings, HelpCircle, X } from 'lucide-react';

const TimerContainer: React.FC = () => {
  const { 
    mode, 
    settings, 
    updateSettings 
  } = useTimerStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration);
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval);
  
  const handleSaveSettings = () => {
    updateSettings({
      workDuration,
      breakDuration,
      longBreakDuration,
      longBreakInterval,
    });
    setShowSettings(false);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">Timer</h2>
        <div className="flex space-x-2">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </CustomButton>
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </CustomButton>
        </div>
      </div>
      
      {showHelp && (
        <div className="mb-8 glass-card p-6 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Timer Help</h3>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(false)}
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
      )}
      
      {showSettings && (
        <div className="mb-8 glass-card p-6 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Timer Settings</h3>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
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
      )}
      
      {mode === 'pomodoro' ? (
        <PomodoroTimer />
      ) : (
        <ProgressTimer />
      )}
    </div>
  );
};

export default TimerContainer;
