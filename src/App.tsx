
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats";
import Chat from "./pages/Chat";
import Discover from "./pages/Discover";
import Channels from "./pages/Channels";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { AuthUser } from "./types";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);
  
  // Still checking auth state
  if (isAuthenticated === null) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  
  useEffect(() => {
    // Load user data from localStorage on app start
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/chats" element={
          <ProtectedRoute>
            <Chats />
          </ProtectedRoute>
        } />
        <Route path="/chat/:id" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/discover" element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        } />
        <Route path="/channels" element={
          <ProtectedRoute>
            <Channels />
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
