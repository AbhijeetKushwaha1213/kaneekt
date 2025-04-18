
import React, { useState } from "react";
import { 
  Users, Lock, Hash, User, Crown, Mic, Bell, Globe, 
  Shield, Eye, Star, Clock, MessageSquare, Heart,
  Bookmark, MoreHorizontal, Flame, Calendar
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, ChannelAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ChannelMember {
  id: string;
  name: string;
  avatar?: string;
}

interface EnhancedChannelCardProps {
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
    activeMembers?: ChannelMember[];
    recentActivity?: {
      type: 'message' | 'event' | 'join';
      text: string;
      timestamp: Date;
      user?: string;
    }[];
  };
  currentUserId?: string;
  onDelete?: (channelId: string) => void;
  onJoin?: (channelId: string) => void;
  onSave?: (channelId: string) => void;
  onMute?: (channelId: string) => void;
  isJoined?: boolean;
  isSaved?: boolean;
  isMuted?: boolean;
  className?: string;
}

export function EnhancedChannelCard({ 
  channel, 
  currentUserId = "user-1",
  onDelete, 
  onJoin,
  onSave,
  onMute,
  isJoined = false,
  isSaved = false,
  isMuted = false,
  className 
}: EnhancedChannelCardProps) {
  const isOwner = channel.ownerId === currentUserId;
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  
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
    
    if (onJoin) {
      onJoin(channel.id);
    } else {
      // Navigate to the channel
      navigate(`/channels/${channel.id}`);
    }
  };
  
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(channel.id);
    }
  };
  
  const handleMuteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMute) {
      onMute(channel.id);
    }
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
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-colors">
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
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 transition-colors">
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
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 transition-colors">
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

  // Mock active members for the demo
  const activeMembers = channel.activeMembers || [
    { id: "m1", name: "Alex", avatar: "https://i.pravatar.cc/150?u=alex" },
    { id: "m2", name: "Taylor", avatar: "https://i.pravatar.cc/150?u=taylor" },
    { id: "m3", name: "Jordan", avatar: "https://i.pravatar.cc/150?u=jordan" },
  ];

  // Mock recent activity for the demo
  const recentActivity = channel.recentActivity || [
    { type: 'message', text: 'Has anyone seen the latest episode?', timestamp: new Date(Date.now() - 1000 * 60 * 30), user: 'Jamie' },
    { type: 'join', text: 'joined the channel', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), user: 'Alex' },
    { type: 'event', text: 'created an event: "Book club meeting"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), user: 'Taylor' },
  ];
  
  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Card 
          className={cn(
            "overflow-hidden transition-all duration-300 h-full group cursor-pointer border",
            "hover:shadow-lg hover:border-primary/30 hover:translate-y-[-2px]",
            isOwner ? "border-primary/30 bg-primary/5" : "border-border/50",
            isJoined && !isOwner && "border-green-500/30 bg-green-50/10",
            className
          )}
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Channel banner with gradient background */}
          <div className={cn(
            "h-24 relative bg-gradient-to-r overflow-hidden", 
            getChannelGradient()
          )}>
            {/* Optional channel emoji or image */}
            {channel.emoji && (
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">
                {channel.emoji}
              </div>
            )}
            
            {/* Channel type indicator */}
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
              {channel.type === 'voice' ? (
                <Mic className="h-4 w-4 text-foreground" />
              ) : (
                <Hash className="h-4 w-4 text-foreground" />
              )}
            </div>
            
            {/* "Trending" or popular tag */}
            {channel.members > 50 && (
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center text-xs font-medium">
                <Flame className="h-3 w-3 text-orange-500 mr-1" />
                <span>Popular</span>
              </div>
            )}
            
            {/* Channel icon/avatar */}
            <div className="absolute -bottom-6 left-6">
              <ChannelAvatar className="h-12 w-12 border-4 border-background shadow-lg bg-gradient-to-br from-primary/20 to-secondary/20 transition-transform group-hover:scale-110">
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
                {isJoined && !isOwner && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You've joined this channel</p>
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
                <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  {channel.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2 space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {channel.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {channel.tags.map((tag) => (
                <InterestBadge key={tag} label={tag} className="text-xs py-0.5 px-2" />
              ))}
            </div>
            
            {/* Member avatar group */}
            <div className="flex items-center mt-2">
              <div className="flex -space-x-2 mr-2">
                {activeMembers.slice(0, 3).map((member, idx) => (
                  <Avatar key={member.id} className="border-2 border-background h-6 w-6 transition-transform hover:translate-y-[-2px]">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : (
                      <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                ))}
                {channel.members > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                    +{channel.members - 3}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {getLastActivityText()}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-3">
            <div className="w-full flex gap-2">
              <Button
                variant={isJoined || isOwner ? "default" : "outline"}
                className={cn(
                  "flex-1", 
                  isOwner && "bg-primary text-primary-foreground",
                  isJoined && !isOwner && "bg-green-500 text-white hover:bg-green-600",
                  "group-hover:border-primary/30 transition-all"
                )}
                size="sm"
                onClick={handleJoinClick}
              >
                {isOwner ? 
                  "Manage Channel" : 
                  isJoined ?
                    "View Channel" :
                    channel.inviteOnly ? 
                      "Request Invite" : 
                      channel.isPrivate ? 
                        "Request to Join" : 
                        "Join Channel"
                }
              </Button>
              
              <div className="flex gap-1">
                {!isOwner && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "size-8", 
                              "opacity-0 group-hover:opacity-100 transition-opacity",
                              isMuted && "text-muted bg-muted/30"
                            )}
                            onClick={handleMuteClick}
                          >
                            {isMuted ? <Bell className="h-4 w-4 text-muted-foreground" /> : <Bell className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isMuted ? "Unmute channel" : "Mute channel"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "size-8",
                              "opacity-0 group-hover:opacity-100 transition-opacity",
                              isSaved && "text-amber-500 bg-amber-50"
                            )}
                            onClick={handleSaveClick}
                          >
                            {isSaved ? <Star className="h-4 w-4 fill-amber-500" /> : <Star className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isSaved ? "Unsave channel" : "Save channel"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
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
            </div>
          </CardFooter>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-80 p-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <ChannelAvatar className="h-10 w-10">
              <AvatarFallback className="text-lg font-semibold">
                {channel.name.charAt(0)}
              </AvatarFallback>
            </ChannelAvatar>
            <div>
              <h4 className="font-medium">{channel.name}</h4>
              <p className="text-xs text-muted-foreground">{channel.members} members</p>
            </div>
          </div>
          
          <p className="text-sm mb-3">{channel.description}</p>
          
          <div className="space-y-2 mb-3">
            <h5 className="text-sm font-medium">Recent activity</h5>
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="text-xs bg-muted/50 p-2 rounded-md">
                  <span className="font-medium">{activity.user}</span> {activity.text}
                  <div className="text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-3">
            <Button 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/channels/${channel.id}`);
              }}
            >
              {isJoined ? "View Channel" : "Join Channel"}
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
