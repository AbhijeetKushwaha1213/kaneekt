export interface User {
  id: string;
  name: string;
  age: number;
  location?: string;
  avatar?: string;
  bio: string;
  interests: string[];
  distance?: number;
  gender?: string;
  dob?: string;
  email?: string;
  username?: string;
  followers?: number;
  following?: number;
  isPrivate?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  tags: string[];
  isPrivate: boolean;
  inviteOnly?: boolean;
  ownerId?: string;
  createdAt?: Date;
  type?: 'text' | 'voice' | 'video';
  category?: string;
  visibility?: 'public' | 'private' | 'invite';
  lastActivity?: Date;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isCurrentUser: boolean;
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  mediaUrl?: string;
  reactions?: Reaction[];
  status?: 'sent' | 'delivered' | 'read' | string;
  attachment?: {
    type: 'image' | 'document' | 'video' | 'voice' | 'location';
    url: string;
    name: string;
  };
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
  };
  isStarred?: boolean;
  disappearAt?: Date;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName?: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: Date;
    isTyping?: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    timestamp: Date;
    unread: boolean;
    type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
    status?: 'sent' | 'delivered' | 'read';
  };
  isApproved?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  theme?: string;
  unreadCount?: number;
}

export interface GroupConversation extends Conversation {
  isGroup: true;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
  }[];
  description?: string;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: Date;
  likes: number;
  comments: number;
  isPublic: boolean;
  type?: 'post' | 'event' | 'announcement';
  eventDate?: Date;
  eventLocation?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  isLoggedIn: boolean;
  createdAt?: string;
  password?: string;
  location?: string;
  gender?: string;
  dob?: string;
}
