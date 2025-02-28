
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Mock conversation data
const CONVERSATIONS = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Emma Thompson",
      avatar: "/placeholder.svg"
    },
    lastMessage: {
      id: "m1",
      content: "Are you still interested in joining the hiking group this weekend?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      unread: true,
    }
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Michael Chen",
      avatar: "/placeholder.svg"
    },
    lastMessage: {
      id: "m2",
      content: "I found an interesting article about quantum computing that I think you'd enjoy.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unread: false,
    }
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Sophia Rodriguez",
      avatar: "/placeholder.svg"
    },
    lastMessage: {
      id: "m3",
      content: "Let's continue our discussion about climate policy later today.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unread: false,
    }
  },
  {
    id: "4",
    user: {
      id: "u4",
      name: "Noah Williams",
      avatar: "/placeholder.svg"
    },
    lastMessage: {
      id: "m4",
      content: "I'm putting together a basketball game for Saturday. Interested?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
      unread: true,
    }
  },
  {
    id: "5",
    user: {
      id: "u5",
      name: "Olivia Johnson",
      avatar: "/placeholder.svg"
    },
    lastMessage: {
      id: "m5",
      content: "Thanks for sharing your thoughts on the book. I found your perspective fascinating.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      unread: false,
    }
  },
];

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const filteredConversations = CONVERSATIONS.filter(
    convo => convo.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/chats/${conversation.id}`}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors",
                    conversation.lastMessage.unread && "bg-accent/30"
                  )}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                    <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-sm line-clamp-1 mt-0.5",
                      conversation.lastMessage.unread 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground"
                    )}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  
                  {conversation.lastMessage.unread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
