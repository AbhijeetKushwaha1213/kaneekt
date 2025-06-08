
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUserInterests() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchInterests();
    }
  }, [user]);

  const fetchInterests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      if (error) throw error;
      setInterests(data?.map(item => item.interest) || []);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInterest = async (interest: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('user_interests')
        .insert([{
          user_id: user.id,
          interest: interest.toLowerCase()
        }]);

      if (error) throw error;

      setInterests(prev => [...prev, interest.toLowerCase()]);
      
      // Update profile interests as well
      await supabase
        .from('profiles')
        .update({
          interests: [...interests, interest.toLowerCase()]
        })
        .eq('id', user.id);

      return { success: true };
    } catch (error) {
      console.error('Error adding interest:', error);
      return { error: error.message };
    }
  };

  const removeInterest = async (interest: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .eq('interest', interest);

      if (error) throw error;

      const newInterests = interests.filter(i => i !== interest);
      setInterests(newInterests);
      
      // Update profile interests as well
      await supabase
        .from('profiles')
        .update({
          interests: newInterests
        })
        .eq('id', user.id);

      return { success: true };
    } catch (error) {
      console.error('Error removing interest:', error);
      return { error: error.message };
    }
  };

  return {
    interests,
    loading,
    addInterest,
    removeInterest,
    refetch: fetchInterests
  };
}
