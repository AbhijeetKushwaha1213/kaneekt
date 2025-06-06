
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionStatus {
  isComplete: boolean;
  hasName: boolean;
  hasBio: boolean;
  hasInterests: boolean;
  loading: boolean;
}

export function useProfileCompletion() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    hasName: false,
    hasBio: false,
    hasInterests: false,
    loading: true
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        isComplete: false,
        hasName: false,
        hasBio: false,
        hasInterests: false,
        loading: false
      });
      return;
    }

    const checkProfileCompletion = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, bio, interests')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile completion:', error);
          setStatus(prev => ({ ...prev, loading: false }));
          return;
        }

        const hasName = !!(profile?.name?.trim());
        const hasBio = !!(profile?.bio?.trim());
        const hasInterests = !!(profile?.interests?.length);
        const isComplete = hasName; // Minimum requirement

        setStatus({
          isComplete,
          hasName,
          hasBio,
          hasInterests,
          loading: false
        });
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkProfileCompletion();
  }, [user]);

  return status;
}
