import { Users, Lock, Hash, User, Crown, Mic, Bell, Globe, Shield, Eye, Star, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, ChannelAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    description: string;
    members: number;
    tags: string[];
    isPrivate: boolean;
    inviteOnly?: boolean;
    ownerId?: string;
    createdAt?: Date;
    type?: 'text' | 'voice' | 'video';
    category?: string;
    lastActivity?: Date;
    coverImage?: string;
    emoji?: string;
  };
  onDelete?: (channelId: string) => void;
  className?: string;
}

export function ChannelCard({ channel, onDelete, className }: ChannelCardProps) {
  const isOwner = channel.ownerId === "user-1"; // Assuming "user-1" is the current user ID
  const navigate = useNavigate();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(channel.id);
    }
  };
  
  const handleClick = () => {
    navigate(`/channels/${channel.id}`);
  };
  
  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to the channel
    navigate(`/channels/${channel.id}`);
  };

  // Generate a gradient based on the channel name for the banner
  const getChannelGradient = () => {
    // Use the channel name to generate a consistent color
    const hash = channel.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 40) % 360;
    
    return `from-[hsl(${h1},70%,80%)] to-[hsl(${h2},70%,70%)]`;
  };
  
  // Format time for last activity
  const getLastActivityText = () => {
    if (channel.lastActivity) {
      return `Active ${formatDistanceToNow(channel.lastActivity, { addSuffix: true })}`;
    }
    return channel.createdAt 
      ? `Created ${formatDistanceToNow(channel.createdAt, { addSuffix: true })}` 
      : 'New channel';
  };
  
  // Get the privacy badge
  const getPrivacyBadge = () => {
    if (channel.inviteOnly) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200">
                <User className="h-3 w-3 mr-1" />
                Invite Only
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Only invited users can join this channel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (channel.isPrivate) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Request to join this private channel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Anyone can join this public channel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 h-full group hover:cursor-pointer border",
        "hover:shadow-md hover:border-primary/30",
        isOwner ? "border-primary/30 bg-primary/5" : "border-border/50",
        className
      )}
      onClick={handleClick}
    >
      {/* Channel banner with gradient background */}
      <div className={cn(
        "h-20 relative bg-gradient-to-r", 
        getChannelGradient()
      )}>
        {/* Channel type indicator */}
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
          {channel.type === 'voice' ? (
            <Mic className="h-4 w-4 text-foreground" />
          ) : (
            <Hash className="h-4 w-4 text-foreground" />
          )}
        </div>
        
        {/* Channel icon/avatar */}
        <div className="absolute -bottom-6 left-6">
          <ChannelAvatar className="h-12 w-12 border-4 border-background shadow-sm bg-gradient-to-br from-primary/20 to-secondary/20">
            <AvatarFallback className="text-xl font-semibold">
              {channel.name.charAt(0)}
            </AvatarFallback>
          </ChannelAvatar>
        </div>
      </div>
      
      <CardHeader className="pt-8 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {channel.name}
            {isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Crown className="h-4 w-4 ml-2 inline-block text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You own this channel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            {channel.members}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          {getPrivacyBadge()}
          
          {channel.category && (
            <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">
              {channel.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {channel.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {channel.tags.map((tag) => (
            <InterestBadge key={tag} label={tag} className="text-xs py-0.5 px-2" />
          ))}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          {getLastActivityText()}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full flex gap-2">
          <Button
            variant={isOwner ? "default" : "outline"}
            className={cn(
              "flex-1", 
              isOwner && "bg-primary text-primary-foreground",
              "group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:border-primary/30 transition-all"
            )}
            size="sm"
            onClick={handleJoinClick}
          >
            {isOwner ? 
              "Manage Channel" : 
              channel.inviteOnly ? 
                "Request Invite" : 
                channel.isPrivate ? 
                  "Request to Join" : 
                  "Join Channel"
            }
          </Button>
          
          {!isOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Add notification functionality
                      window.alert("You will receive notifications from this channel.");
                    }}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get notifications from this channel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isOwner && onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete this channel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
