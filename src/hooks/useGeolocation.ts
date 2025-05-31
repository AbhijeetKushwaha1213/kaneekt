
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });
  const { toast } = useToast();

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setState(prev => ({ 
        ...prev, 
        error: errorMsg,
        loading: false 
      }));
      toast({
        title: 'Location Error',
        description: errorMsg,
        variant: 'destructive'
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // First check if permissions are granted
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setState(prev => ({ 
            ...prev, 
            error: 'Location access denied. Please enable location in your browser settings.',
            loading: false 
          }));
          toast({
            title: 'Location Permission Denied',
            description: 'Please enable location access in your browser settings and try again.',
            variant: 'destructive'
          });
          return;
        }
      });
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
        
        toast({
          title: 'Location Found',
          description: `Location updated successfully (±${Math.round(position.coords.accuracy)}m accuracy)`,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your GPS/internet connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          loading: false 
        }));
        
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive'
        });
      },
      options
    );
  };

  const watchPosition = () => {
    if (!navigator.geolocation) return null;

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000,
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({ 
          ...prev, 
          error: error.message,
          loading: false 
        }));
      },
      options
    );
  };

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
  };
}
