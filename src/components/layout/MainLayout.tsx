
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Search, Bell, Users, Settings, LogOut, Mic, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback, ChannelAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    {
      icon: Home,
      label: "Home",
      href: "/discover",
      active: location.pathname === "/discover",
    },
    {
      icon: MessageSquare,
      label: "Chats",
      href: "/chats",
      active: location.pathname === "/chats" || location.pathname.startsWith("/chats/"),
    },
    {
      icon: Users,
      label: "Channels",
      href: "/channels",
      active: location.pathname === "/channels" || location.pathname.startsWith("/channels/"),
    },
    {
      icon: Search,
      label: "Discover",
      href: "/discover",
      active: location.pathname === "/discover",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 bg-background">
        <div className="container flex items-center justify-between px-4 relative">
          <Link to="/" className="text-xl font-bold">syncterest</Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            
            {/* Channel avatar icon */}
            <ChannelAvatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="Current channel" />
              <AvatarFallback>CH</AvatarFallback>
            </ChannelAvatar>
            
            {/* Voice chat button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Voice chat"
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            {user ? (
              <Link to="/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.user_metadata?.name || "Profile"} />
                  <AvatarFallback>{(user.user_metadata?.name || user.email || "U").charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        <aside className="hidden md:flex w-16 flex-col items-center pt-6 pb-10 border-r bg-background">
          {navItems.map((item) => (
            <Link to={item.href} key={item.label}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "mb-4",
                  item.active ? "bg-accent text-accent-foreground" : ""
                )}
                aria-label={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
          <div className="mt-auto">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "mb-4",
                  location.pathname === "/profile" ? "bg-accent text-accent-foreground" : ""
                )}
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="mb-4"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="mb-4 text-red-500"
                aria-label="Sign Out"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
};
