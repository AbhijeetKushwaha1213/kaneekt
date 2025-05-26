
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to auth page if not logged in, or to chats if logged in
  useEffect(() => {
    if (user) {
      navigate("/chats");
    } else {
      navigate("/auth?tab=login");
    }
  }, [user, navigate]);

  return null; // This component just redirects
};

export default Login;
