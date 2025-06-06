
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isComplete: profileComplete, loading: profileLoading } = useProfileCompletion();
  
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!profileComplete) {
        navigate("/onboarding");
      } else {
        navigate("/chats");
      }
    }
  }, [user, authLoading, profileComplete, profileLoading, navigate]);
  
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-2xl font-bold mt-4">Loading...</h2>
          <p className="text-muted-foreground">Checking your authentication status</p>
        </div>
      </div>
    );
  }
  
  return null;
}
