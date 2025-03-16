
import { Navigate, Outlet } from "react-router-dom";
import Header from "@/components/navigation/Header";
import useUser from "@/hooks/useUser";

function RootLayout() {
  const { user, loading } = useUser();
  
  if (loading) return <h1>Loading...</h1>;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
