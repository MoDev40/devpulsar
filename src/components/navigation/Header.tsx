
import React from 'react';
import { Clock, CheckSquare, Github, LogOut, BarChart2, FileText } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { useTimerStore } from '@/store/timerStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface HeaderProps {
  activeTab: 'tasks' | 'timer' | 'dashboard' | 'notes';
  setActiveTab: (tab: 'tasks' | 'timer' | 'dashboard' | 'notes') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { mode, setTimerMode } = useTimerStore();
  const { user, signOut } = useAuthStore();
  const [showTimerModes, setShowTimerModes] = React.useState(false);

  const handleTimerModeChange = (timerMode: 'pomodoro' | 'progress') => {
    setTimerMode(timerMode);
    setShowTimerModes(false);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
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
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Dashboard
              </CustomButton>
              
              <CustomButton
                variant={activeTab === 'notes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('notes')}
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Notes
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
                            mode === 'pomodoro' ? 'bg-muted' : 'hover:bg-muted'
                          }`}
                          onClick={() => handleTimerModeChange('pomodoro')}
                        >
                          Pomodoro
                        </button>
                        <button
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            mode === 'progress' ? 'bg-muted' : 'hover:bg-muted'
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
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 flex items-center justify-center"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Stats
          </CustomButton>
          
          <CustomButton
            variant={activeTab === 'notes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notes')}
            className="flex-1 flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Notes
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
              variant={mode === 'pomodoro' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimerModeChange('pomodoro')}
            >
              Pomodoro
            </CustomButton>
            <CustomButton
              variant={mode === 'progress' ? 'default' : 'outline'}
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
