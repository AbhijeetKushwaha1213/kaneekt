
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Add a small delay to ensure auth context is fully initialized
    const timer = setTimeout(() => {
      if (!loading) {
        try {
          if (user) {
            navigate("/discover", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        } catch (error) {
          console.error("Navigation error:", error);
          // Fallback navigation
          window.location.href = "/auth";
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }
  
  // Show a minimal fallback while navigation is happening
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Syncterest</h2>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
