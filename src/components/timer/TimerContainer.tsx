import React, { useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import PomodoroTimer from "./PomodoroTimer";
import ProgressTimer from "./ProgressTimer";
import { CustomButton } from "@/components/ui/custom-button";
import { Settings, HelpCircle } from "lucide-react";
import TimerSettings from "./TimerSettings";
import TimerHelp from "./TimerHelp";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

const TimerContainer: React.FC = () => {
  const { mode, setTimerMode } = useTimerStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col space-y-3">
          <h2 className="text-xl font-medium">Timer</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="timer-mode"
              checked={mode === "pomodoro"}
              onCheckedChange={(checked) =>
                setTimerMode(checked ? "pomodoro" : "progress")
              }
            />
            <Label htmlFor="timer-mode">
              {mode === "progress" ? "Progress Mode" : "Pomodoro Mode"}
            </Label>
          </div>
        </div>
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

      {showHelp && <TimerHelp onClose={() => setShowHelp(false)} />}
      {showSettings && <TimerSettings onClose={() => setShowSettings(false)} />}

      {mode === "pomodoro" ? <PomodoroTimer /> : <ProgressTimer />}
    </div>
  );
};

export default TimerContainer;
