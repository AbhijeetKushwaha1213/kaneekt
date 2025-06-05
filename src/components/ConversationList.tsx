
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Pin, Archive, Bell, BellOff, Trash2, MoreVertical, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/hooks/useConversations";

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, loading } = useConversations();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const filteredConversations = conversations
    .filter(convo => 
      convo.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convo.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by timestamp
      return new Date(b.lastMessage.timestamp).getTime() - 
             new Date(a.lastMessage.timestamp).getTime();
    });

  const navigateToDiscoverPage = () => {
    navigate("/discover");
  };
  
  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };
  
  const getMessageTypePreview = (type?: string, content: string = "") => {
    if (!type || type === 'text') return content;
    
    switch (type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎬 Video';
      case 'voice':
        return '🎤 Voice message';
      case 'file':
        return '📎 File';
      case 'location':
        return '📍 Location';
      default:
        return content;
    }
  };

  if (loading) {
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
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Button onClick={navigateToDiscoverPage} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Start new chat
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/chats/${conversation.id}`}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors relative",
                    conversation.isPinned && "bg-accent/20",
                    conversation.lastMessage.unread && "bg-accent/30"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    {conversation.user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate flex items-center gap-1">
                        {conversation.isPinned && <Pin className="h-3 w-3" />}
                        {conversation.user.name}
                        {conversation.isMuted && <BellOff className="h-3 w-3 ml-1 text-muted-foreground" />}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={cn(
                        "text-sm line-clamp-1",
                        conversation.lastMessage.unread 
                          ? "text-foreground font-medium" 
                          : "text-muted-foreground"
                      )}>
                        {getMessageTypePreview(conversation.lastMessage.type, conversation.lastMessage.content)}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        {getMessageStatusIcon(conversation.lastMessage.status)}
                        
                        {(conversation.unreadCount && conversation.unreadCount > 0) && (
                          <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Floating Action Button to start new chat */}
      <div className="absolute bottom-20 right-4 md:bottom-4">
        <Button 
          onClick={navigateToDiscoverPage}
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
