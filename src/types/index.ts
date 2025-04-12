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
  type?: 'text' | 'image' | 'video' | 'voice';
  mediaUrl?: string;
  reactions?: Reaction[];
  status?: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  };
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    timestamp: Date;
    unread: boolean;
  };
  isApproved?: boolean;
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
