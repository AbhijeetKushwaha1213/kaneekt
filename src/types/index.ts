
export interface User {
  id: string;
  name: string;
  age: number;
  location?: string;
  avatar?: string;
  bio: string;
  interests: string[];
  distance?: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  tags: string[];
  isPrivate: boolean;
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
}
