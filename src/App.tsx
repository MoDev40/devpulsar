
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import useUser from "./hooks/useUser";
import { useTaskStore } from "./store/taskStore";
import { useFirstVisit } from "./hooks/useFirstVisit";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

function App() {
  const { user } = useUser();
  const { subscribeToTasks, unsubscribeFromTasks, loadTasks } = useTaskStore();
  const isFirstVisit = useFirstVisit();

  useEffect(() => {
    if (user) {
      subscribeToTasks();
    }
    loadTasks();
    return () => {
      unsubscribeFromTasks();
    };
  }, [user, subscribeToTasks, unsubscribeFromTasks, loadTasks]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      {isFirstVisit ? (
        <ShadcnToaster />
      ) : (
        <SonnerToaster position="top-right" richColors />
      )}
    </ThemeProvider>
  );
}

export default App;
