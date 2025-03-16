import useUser from "@/hooks/useUser";
import { Navigate, useLocation } from "react-router-dom";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
