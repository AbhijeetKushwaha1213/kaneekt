
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Redirect to chats if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log("User already authenticated, redirecting to /chats");
      navigate("/chats");
    }
  }, [user, loading, navigate]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-4 bg-background">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">syncterest</h1>
        </div>
      </header>
      
      {/* Auth form */}
      <div className="flex-1 flex flex-col">
        <AuthForm />
      </div>
    </div>
  );
}
