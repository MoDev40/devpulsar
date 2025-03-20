
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "sonner";
import { router } from "./routes";
import { cleanupTimerStore } from "./store/timerStore";

const App = () => {
  // Cleanup timer when app unmounts
  useEffect(() => {
    return () => {
      cleanupTimerStore();
    };
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  );
};

export default App;
