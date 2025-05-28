
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Channel } from '@/types';
import { Users, Lock, Globe, User } from 'lucide-react';

interface ChannelActionsProps {
  channel: Channel;
  isJoined: boolean;
  onJoin: (channelId: string) => void;
  onLeave: (channelId: string) => void;
}

export function ChannelActions({ channel, isJoined, onJoin, onLeave }: ChannelActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onJoin(channel.id);
      toast({
        title: "Joined channel",
        description: `You've successfully joined ${channel.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to join",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onLeave(channel.id);
      toast({
        title: "Left channel",
        description: `You've left ${channel.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to leave",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivacyBadge = () => {
    if (channel.inviteOnly) {
      return (
        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
          <User className="h-3 w-3 mr-1" />
          Invite Only
        </Badge>
      );
    }
    
    if (channel.isPrivate) {
      return (
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        <Globe className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  };

  const getButtonText = () => {
    if (isJoined) return "View Channel";
    if (channel.inviteOnly) return "Request Invite";
    if (channel.isPrivate) return "Request to Join";
    return "Join Channel";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPrivacyBadge()}
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            {channel.members}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {isJoined ? (
          <>
            <Link to={`/channels/${channel.id}`} className="flex-1">
              <Button variant="default" className="w-full" disabled={isLoading}>
                View Channel
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLeave}
              disabled={isLoading}
            >
              {isLoading ? "Leaving..." : "Leave"}
            </Button>
          </>
        ) : (
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : getButtonText()}
          </Button>
        )}
      </div>
    </div>
  );
}
