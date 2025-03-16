import { createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import RootLayout from "@/layout/root-layout";
import Index from "@/pages/Index";
import GitHub from "@/pages/GitHub";
import TimerContainer from "@/components/timer/TimerContainer";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      {
        path: "/github",
        element: <GitHub />,
      },
      {
        path: "/timer",
        element: <TimerContainer />,
      },
    ],
    errorElement: <NotFound />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/github-callback",
    element: <Auth />,
  },
]);
