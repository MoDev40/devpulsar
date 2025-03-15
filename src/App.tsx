
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { router } from "./routes";
import { useEffect } from "react";
import { cleanupTimerStore } from "./store/timerStore";

const queryClient = new QueryClient();

const App = () => {
  // Cleanup timer when app unmounts
  useEffect(() => {
    return () => {
      cleanupTimerStore();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
