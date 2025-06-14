
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Channel } from '@/types';
import { Users, Lock, Globe, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChannelActionsProps {
  channel: Channel;
  isJoined: boolean;
  onJoin: (channelId: string) => void;
  onLeave: (channelId: string) => void;
}

// Helper to ensure channel exists in Supabase and return the channel id
async function ensureSupabaseChannel(channel: Channel, userId: string) {
  // Try to find the channel in Supabase by name
  const { data: existingChannels } = await supabase
    .from('channels')
    .select('id')
    .eq('name', channel.name);

  let supabaseChannelId = existingChannels && existingChannels[0]?.id;

  if (!supabaseChannelId) {
    // Create the channel in supabase
    const { data, error } = await supabase.from('channels').insert([{
      name: channel.name,
      description: channel.description || '',
      tags: channel.tags || [],
      owner_id: userId,
      is_private: channel.isPrivate || false,
      invite_only: (channel as any).inviteOnly || false,
      member_count: 1
    }]).select().single();

    if (error) throw error;
    supabaseChannelId = data.id;
  }

  // Add current user as a member (if not already)
  // Check if membership exists
  const { data: memberData, error: memberError } = await supabase
    .from('channel_members')
    .select('id')
    .eq('channel_id', supabaseChannelId)
    .eq('user_id', userId);

  if (!memberData?.length) {
    await supabase.from('channel_members').insert([{
      channel_id: supabaseChannelId,
      user_id: userId,
      role: 'member'
    }]);
  }

  return supabaseChannelId;
}

export function ChannelActions({ channel, isJoined, onJoin, onLeave }: ChannelActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please sign in to join a channel.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      const supabaseChannelId = await ensureSupabaseChannel(channel, user.id);
      onJoin(supabaseChannelId); // this updates any parent state if needed

      toast({
        title: "Joined channel",
        description: `You've successfully joined ${channel.name}`,
      });

      // Route to channel page
      navigate(`/channels/${supabaseChannelId}`);
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    try {
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
    if ((channel as any).inviteOnly) {
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
    if ((channel as any).inviteOnly) return "Request Invite";
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
            <Button 
              variant="default" 
              className="w-full"
              disabled={isLoading}
              onClick={() => navigate(`/channels/${channel.id}`)}
            >
              View Channel
            </Button>
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

