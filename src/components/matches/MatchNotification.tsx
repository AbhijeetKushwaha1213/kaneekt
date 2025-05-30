
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function MatchNotification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for new matches
    const channel = supabase
      .channel('matches')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'conversations',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        }, 
        async (payload) => {
          if (payload.new.is_match) {
            await handleNewMatch(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNewMatch = async (matchData: any) => {
    try {
      // Get the other user's profile
      const otherUserId = matchData.user1_id === user?.id ? matchData.user2_id : matchData.user1_id;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .eq('id', otherUserId)
        .single();

      if (error) throw error;

      const match: Match = {
        ...matchData,
        profiles: profile
      };

      setNewMatch(match);
      setShowDialog(true);

      // Show toast notification
      toast({
        title: "It's a Match! 🎉",
        description: `You and ${profile.name} liked each other!`,
      });

      // Play celebration sound (if available)
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {
          // Fail silently if sound can't play
        });
      } catch (error) {
        // Fail silently
      }
    } catch (error) {
      console.error('Error handling new match:', error);
    }
  };

  const startChat = () => {
    if (!newMatch || !user) return;
    
    const otherUserId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;
    window.location.href = `/chats/${otherUserId}`;
  };

  const keepSwiping = () => {
    setShowDialog(false);
    setNewMatch(null);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center space-y-6 p-6">
          {/* Celebration Header */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-32 w-32 text-pink-200 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-pink-600 relative z-10">
              It's a Match!
            </h2>
          </div>

          {/* Users Avatars */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-pink-300">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.user_metadata?.name?.[0] || 'You'}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-pink-500 rounded-full p-1">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
            
            <div className="text-4xl animate-bounce">💕</div>
            
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-purple-300">
                <AvatarImage src={newMatch?.profiles?.avatar} />
                <AvatarFallback>{newMatch?.profiles?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -left-2 bg-purple-500 rounded-full p-1">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Match Message */}
          <div>
            <p className="text-lg font-medium text-gray-800">
              You and {newMatch?.profiles?.name} liked each other!
            </p>
            <p className="text-gray-600 mt-2">
              Start a conversation and see where it goes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={startChat}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chatting
            </Button>
            
            <Button 
              variant="outline" 
              onClick={keepSwiping}
              className="w-full"
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
