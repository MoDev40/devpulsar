import { createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
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
    path: "/auth",
    element: <Auth />,
  },
]);
