
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    if (!loading && !isNavigating) {
      setIsNavigating(true);
      
      const handleNavigation = () => {
        try {
          if (user) {
            console.log("User authenticated, navigating to discover");
            navigate("/discover", { replace: true });
          } else {
            console.log("No user, navigating to auth");
            navigate("/auth", { replace: true });
          }
        } catch (error) {
          console.error("Navigation error:", error);
          // Fallback to window location as last resort
          if (user) {
            window.location.href = "/discover";
          } else {
            window.location.href = "/auth";
          }
        }
      };

      // Small delay to ensure components are mounted
      const timer = setTimeout(handleNavigation, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, isNavigating]);
  
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Syncterest</h2>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
