
import React, { useState } from 'react';
import { Clock, CheckSquare, Github, LogOut } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { TimerMode } from '@/types';
import { useTimerContext } from '@/context/TimerContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface HeaderProps {
  activeTab: 'tasks' | 'timer';
  setActiveTab: (tab: 'tasks' | 'timer') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { timerState, setTimerMode } = useTimerContext();
  const { user, signOut } = useAuth();
  const [showTimerModes, setShowTimerModes] = useState(false);

  const handleTimerModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setShowTimerModes(false);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="w-full py-6 mb-8 border-b border-border/40">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">D</span>
            </div>
            <h1 className="text-2xl font-medium">DevPulsar</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex bg-muted rounded-lg p-1">
              <CustomButton
                variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('tasks')}
                className="flex items-center"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </CustomButton>
              
              <CustomButton
                variant={activeTab === 'timer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('timer')}
                className="flex items-center relative"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timer
                {activeTab === 'timer' && (
                  <div className="absolute top-full mt-2 right-0 z-10">
                    {showTimerModes && (
                      <div className="py-1 bg-white rounded-md shadow-lg border border-border/40 animate-fade-in">
                        <button
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            timerState.mode === 'pomodoro' ? 'bg-muted' : 'hover:bg-muted'
                          }`}
                          onClick={() => handleTimerModeChange('pomodoro')}
                        >
                          Pomodoro
                        </button>
                        <button
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            timerState.mode === 'progress' ? 'bg-muted' : 'hover:bg-muted'
                          }`}
                          onClick={() => handleTimerModeChange('progress')}
                        >
                          Progress
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CustomButton>
            </div>

            {user ? (
              <CustomButton variant="glass" size="sm" className="flex items-center" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </CustomButton>
            ) : (
              <CustomButton variant="glass" size="sm" className="flex items-center">
                <Github className="w-4 h-4 mr-2" />
                Login
              </CustomButton>
            )}
          </div>
        </div>
        
        <div className="sm:hidden flex mt-4 bg-muted rounded-lg p-1">
          <CustomButton
            variant={activeTab === 'tasks' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tasks')}
            className="flex-1 flex items-center justify-center"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Tasks
          </CustomButton>
          
          <CustomButton
            variant={activeTab === 'timer' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('timer')}
            className="flex-1 flex items-center justify-center"
          >
            <Clock className="w-4 h-4 mr-2" />
            Timer
          </CustomButton>
        </div>
        
        {activeTab === 'timer' && (
          <div className="mt-4 flex justify-center space-x-2">
            <CustomButton
              variant={timerState.mode === 'pomodoro' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimerModeChange('pomodoro')}
            >
              Pomodoro
            </CustomButton>
            <CustomButton
              variant={timerState.mode === 'progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimerModeChange('progress')}
            >
              Progress
            </CustomButton>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
