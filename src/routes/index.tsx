
import { createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import GitHub from "@/pages/GitHub";
import { RequireAuth } from "@/components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Index />
      </RequireAuth>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/github",
    element: (
      <RequireAuth>
        <GitHub />
      </RequireAuth>
    ),
  },
  {
    path: "/github-callback",
    element: (
      <RequireAuth>
        <GitHub />
      </RequireAuth>
    ),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);
