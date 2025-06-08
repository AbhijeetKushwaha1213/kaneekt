
// Backend-specific types for the enhanced features

export interface StoryData {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  background_color?: string;
  text_color?: string;
  created_at: string;
  expires_at: string;
}

export interface EventData {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  location: string;
  date_time: string;
  max_attendees?: number;
  categories: string[];
  is_public: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'maybe' | 'not_attending';
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest: string;
  created_at: string;
}

export interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  status: 'looking-to-chat' | 'open-to-meetup' | 'studying' | 'exploring';
  is_sharing: boolean;
  location_name?: string;
  last_updated: string;
  expires_at: string;
}

export interface ChannelData {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_private: boolean;
  invite_only: boolean;
  category?: string;
  tags: string[];
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface UserMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  common_interests: string[];
  distance_km?: number;
  created_at: string;
}

// Enhanced message type for channel support
export interface ChannelMessage extends Message {
  channel_id?: string;
  conversation_id?: string;
}

// Re-export existing types
export * from './index';
export * from './supabase';
