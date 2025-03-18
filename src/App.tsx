
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
    // Log environment variables for debugging
    console.log("Environment variables in App:", {
      NODE_ENV: import.meta.env.MODE,
      VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || "not set",
      VITE_GITHUB_REDIRECT_URI:
        import.meta.env.VITE_GITHUB_REDIRECT_URI || "not set",
      BASE_URL: import.meta.env.BASE_URL,
      AUTH_STATE: localStorage.getItem("github_oauth_state") || "no state found",
      FULL_URL: window.location.href,
      SEARCH_PARAMS: window.location.search
    });

    // Check if we're handling a GitHub OAuth callback with errors
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    
    if (error && errorDescription && errorDescription.includes("OAuth")) {
      console.error("GitHub OAuth error in App.tsx:", error, errorDescription);
    }

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
