
import { Link } from "react-router-dom";
import { Users, Lock, Hash, User, Crown, Mic, Bell, Globe } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
  };
  onDelete?: (channelId: string) => void;
  className?: string;
}

export function ChannelCard({ channel, onDelete, className }: ChannelCardProps) {
  const isOwner = channel.ownerId === "user-1"; // Assuming "user-1" is the current user ID
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(channel.id);
    }
  };
  
  return (
    <Link to={`/channels/${channel.id}`}>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 h-full group",
          "hover:shadow-md hover:border-primary/20",
          isOwner && "border-primary/30 bg-primary/5",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              {channel.type === 'voice' ? (
                <Mic className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
              ) : (
                <Hash className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
              )}
              {channel.name}
              {channel.isPrivate && !channel.inviteOnly && (
                <Lock className="h-4 w-4 ml-2 inline-block text-muted-foreground" />
              )}
              {channel.inviteOnly && (
                <User className="h-4 w-4 ml-2 inline-block text-muted-foreground" />
              )}
              {isOwner && (
                <Crown className="h-4 w-4 ml-2 inline-block text-amber-500" />
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {channel.members}
            </div>
          </div>
          {channel.createdAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Created {formatDistanceToNow(channel.createdAt, { addSuffix: true })}
            </p>
          )}
          {channel.category && (
            <Badge variant="outline" className="mt-1.5">
              {channel.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {channel.tags.map((tag) => (
              <InterestBadge key={tag} label={tag} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="w-full flex gap-2">
            <Button
              variant={isOwner ? "default" : "outline"}
              className={cn("flex-1", isOwner && "bg-primary text-primary-foreground")}
              size="sm"
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
              <Button
                variant="outline"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            {isOwner && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
