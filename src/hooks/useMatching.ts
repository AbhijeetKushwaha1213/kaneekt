
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
  matched_user?: {
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
      generateMatches();
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

      const matchesWithUser = data?.map(match => ({
        ...match,
        matched_user: match.user1_id === user.id ? match.user2 : match.user1
      })) || [];

      setMatches(matchesWithUser);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    if (!user) return;

    try {
      // Get current user's interests
      const { data: userInterests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      if (!userInterests || userInterests.length === 0) return;

      const currentInterests = userInterests.map(i => i.interest);

      // Find users with similar interests
      const { data: potentialMatches } = await supabase
        .from('profiles')
        .select('id, name, avatar, bio, interests')
        .neq('id', user.id)
        .not('interests', 'is', null);

      if (!potentialMatches) return;

      for (const potentialMatch of potentialMatches) {
        if (!potentialMatch.interests) continue;

        const commonInterests = currentInterests.filter(interest => 
          potentialMatch.interests.includes(interest)
        );

        if (commonInterests.length > 0) {
          const matchScore = Math.min(commonInterests.length / Math.max(currentInterests.length, potentialMatch.interests.length), 1);
          
          // Check if match already exists
          const { data: existingMatch } = await supabase
            .from('user_matches')
            .select('id')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${potentialMatch.id}),and(user1_id.eq.${potentialMatch.id},user2_id.eq.${user.id})`)
            .single();

          if (!existingMatch && matchScore > 0.2) { // Only create matches with >20% compatibility
            await supabase
              .from('user_matches')
              .insert({
                user1_id: user.id,
                user2_id: potentialMatch.id,
                match_score: Number(matchScore.toFixed(2)),
                common_interests: commonInterests
              });
          }
        }
      }

      // Refresh matches after generation
      await fetchMatches();
    } catch (error) {
      console.error('Error generating matches:', error);
    }
  };

  return {
    matches,
    loading,
    generateMatches,
    refetch: fetchMatches
  };
}
