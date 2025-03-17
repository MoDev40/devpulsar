
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import useUser from "./hooks/useUser";
import { useTaskStore } from "./store/taskStore";

function App() {
  const { user } = useUser();
  const { subscribeToTasks, unsubscribeFromTasks, loadTasks } = useTaskStore();

  useEffect(() => {
    if (user) {
      subscribeToTasks();
    }
    loadTasks();
    return () => {
      unsubscribeFromTasks();
    };
  }, [user, subscribeToTasks, unsubscribeFromTasks]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}

export default App;
