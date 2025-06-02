
import type { Database } from '@/integrations/supabase/types';

// Define custom types based on the generated Database type
export type Tables = Database['public']['Tables'];

// Profile-related types
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Post-related types
export type Post = Tables['posts']['Row'];
export type PostInsert = Tables['posts']['Insert'];
export type PostUpdate = Tables['posts']['Update'];

// Conversation-related types
export type Conversation = Tables['conversations']['Row'];
export type ConversationInsert = Tables['conversations']['Insert'];
export type ConversationUpdate = Tables['conversations']['Update'];

// Message-related types
export type Message = Tables['messages']['Row'] & {
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  file_data?: string;
  audio_data?: string;
  sender?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
};
export type MessageInsert = Tables['messages']['Insert'];
export type MessageUpdate = Tables['messages']['Update'];

// Extended profile type with optional location fields for future compatibility
export interface ProfileWithLocation extends Profile {
  latitude?: number;
  longitude?: number;
  location_sharing_enabled?: boolean;
  location_updated_at?: string;
}
