
import type { Database } from '@/integrations/supabase/types';

// Define types based on the generated Database type
export type TablesInsert = Database['public']['Tables']['Insert'];
export type TablesRow = Database['public']['Tables']['Row'];
export type TablesUpdate = Database['public']['Tables']['Update'];

// Profile-related types
export type Profile = TablesRow['profiles'];
export type ProfileInsert = TablesInsert['profiles'];
export type ProfileUpdate = TablesUpdate['profiles'];

// Post-related types
export type Post = TablesRow['posts'];
export type PostInsert = TablesInsert['posts'];
export type PostUpdate = TablesUpdate['posts'];

// Conversation-related types
export type Conversation = TablesRow['conversations'];
export type ConversationInsert = TablesInsert['conversations'];
export type ConversationUpdate = TablesUpdate['conversations'];

// Message-related types
export type Message = TablesRow['messages'];
export type MessageInsert = TablesInsert['messages'];
export type MessageUpdate = TablesUpdate['messages'];
