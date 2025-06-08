
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  common_interests: string[];
  distance_km?: number;
  created_at: string;
  matched_user: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    interests: string[];
  };
}

export function useMatching() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_matches')
        .select(`
          *,
          user1:profiles!user_matches_user1_id_fkey (
            id,
            name,
            avatar,
            bio,
            interests
          ),
          user2:profiles!user_matches_user2_id_fkey (
            id,
            name,
            avatar,
            bio,
            interests
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('match_score', { ascending: false });

      if (error) throw error;

      const enhancedMatches = (data || []).map(match => {
        const matchedUser = match.user1_id === user.id ? 
          (Array.isArray(match.user2) ? match.user2[0] : match.user2) : 
          (Array.isArray(match.user1) ? match.user1[0] : match.user1);

        return {
          ...match,
          matched_user: {
            id: matchedUser?.id || '',
            name: matchedUser?.name || '',
            avatar: matchedUser?.avatar || undefined,
            bio: matchedUser?.bio || undefined,
            interests: matchedUser?.interests || []
          },
          common_interests: match.common_interests || [],
          distance_km: match.distance_km ? Number(match.distance_km) : undefined,
          match_score: Number(match.match_score)
        };
      }) as UserMatch[];

      setMatches(enhancedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get current user's interests
      const { data: userInterests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      if (!userInterests?.length) {
        toast({
          title: "No interests found",
          description: "Add interests to your profile to get matches",
          variant: "destructive"
        });
        return;
      }

      const currentInterests = userInterests.map(ui => ui.interest);

      // Find potential matches
      const { data: potentialMatches } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar,
          bio,
          interests
        `)
        .neq('id', user.id)
        .not('interests', 'is', null);

      if (potentialMatches) {
        for (const match of potentialMatches) {
          if (!match.interests?.length) continue;

          const commonInterests = currentInterests.filter(interest => 
            match.interests.includes(interest)
          );

          if (commonInterests.length > 0) {
            const matchScore = commonInterests.length / Math.max(currentInterests.length, match.interests.length);

            // Only create match if score is above threshold
            if (matchScore > 0.2) {
              await supabase.from('user_matches').upsert({
                user1_id: user.id,
                user2_id: match.id,
                match_score: Number(matchScore.toFixed(2)),
                common_interests: commonInterests
              });
            }
          }
        }
      }

      await fetchMatches();
      toast({
        title: "Success",
        description: "Matches updated successfully"
      });
    } catch (error) {
      console.error('Error generating matches:', error);
      toast({
        title: "Error",
        description: "Failed to generate matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    generateMatches,
    refetch: fetchMatches
  };
}
