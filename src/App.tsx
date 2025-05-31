
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Discover from "./pages/Discover";
import Chat from "./pages/Chat";
import Chats from "./pages/Chats";
import Features from "./pages/Features";
import Settings from "./pages/Settings";
import Channels from "./pages/Channels";
import Channel from "./pages/Channel";
import EnhancedChannel from "./pages/EnhancedChannel";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<ProfileView />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chats/:id" element={<Chat />} />
            <Route path="/features" element={<Features />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/channel/:channelId" element={<Channel />} />
            <Route path="/enhanced-channel/:channelId" element={<EnhancedChannel />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
