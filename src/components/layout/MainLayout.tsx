
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Bell, Users, Settings, LogOut, Mic, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback, ChannelAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className={cn("border-b bg-background", isMobile ? "py-2" : "py-4")}>
        <div className={cn("container flex items-center justify-between relative", isMobile ? "px-3" : "px-4")}>
          <Link to="/" className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
            syncterest
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative", isMobile ? "h-8 w-8" : "")}
              aria-label="Notifications"
            >
              <Bell className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            
            {/* Channel avatar icon - hidden on mobile to save space */}
            {!isMobile && (
              <ChannelAvatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Current channel" />
                <AvatarFallback>CH</AvatarFallback>
              </ChannelAvatar>
            )}
            
            {/* Voice chat button - smaller on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative", isMobile ? "h-8 w-8" : "")}
              aria-label="Voice chat"
            >
              <Mic className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
            
            {user ? (
              <>
                {/* Settings icon in header - visible on all screen sizes */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(isMobile ? "h-8 w-8" : "")}
                  aria-label="Settings"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </Button>
                
                {/* Profile avatar */}
                <Link to="/profile">
                  <Avatar className={cn("cursor-pointer", isMobile ? "h-7 w-7" : "h-8 w-8")}>
                    <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.user_metadata?.name || "Profile"} />
                    <AvatarFallback>{(user.user_metadata?.name || user.email || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                onClick={() => navigate("/auth")}
                className={cn(isMobile ? "text-xs px-2" : "")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Fixed sidebar navigation - only visible on desktop */}
        {!isMobile && (
          <aside className="w-16 flex flex-col items-center pt-6 pb-10 border-r bg-background fixed left-0 top-[4.5rem] bottom-0 z-10">
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
                className={cn(
                  "mb-4",
                  location.pathname === "/settings" ? "bg-accent text-accent-foreground" : ""
                )}
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
        )}
        
        {/* Main content with padding to account for fixed sidebar on desktop */}
        <main className={cn(
          "flex-1 overflow-auto bg-background", 
          !isMobile && "ml-16",
          isMobile && "pb-16" // Add bottom padding for mobile navigation
        )}>
          {children}
        </main>
      </div>
      
      {/* Mobile navigation menu at the bottom - enhanced for better touch targets */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-20 safe-area-inset-bottom">
          <div className="flex justify-around py-2">
            <Link to="/discover" className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-12 flex flex-col gap-1",
                  location.pathname === "/discover" ? "text-primary" : "text-muted-foreground"
                )}
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </Button>
            </Link>
            <Link to="/chats" className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-12 flex flex-col gap-1",
                  location.pathname === "/chats" || location.pathname.startsWith("/chats/") 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                aria-label="Chats"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Chats</span>
              </Button>
            </Link>
            <Link to="/channels" className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-12 flex flex-col gap-1",
                  location.pathname === "/channels" || location.pathname.startsWith("/channels/") 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                aria-label="Channels"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Channels</span>
              </Button>
            </Link>
            <Link to="/profile" className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-12 flex flex-col gap-1",
                  location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                )}
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
