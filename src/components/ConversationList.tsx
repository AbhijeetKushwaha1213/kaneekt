
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Pin, Archive, Bell, BellOff, Trash2, MoreVertical, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load conversations from localStorage
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
      } catch (error) {
        console.error("Failed to parse conversations", error);
        setConversations([]);
      }
    } else {
      setConversations([]);
    }
  }, []);
  
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
  
  const handleTouchStart = (id: string) => {
    const timer = setTimeout(() => {
      setLongPressId(id);
    }, 500);
    setTouchTimer(timer);
  };
  
  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };
  
  const pinConversation = (id: string) => {
    const updatedConversations = conversations.map(convo => 
      convo.id === id ? { ...convo, isPinned: !convo.isPinned } : convo
    );
    setConversations(updatedConversations);
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    toast({
      title: updatedConversations.find(c => c.id === id)?.isPinned 
        ? "Conversation pinned" 
        : "Conversation unpinned",
      duration: 2000
    });
  };
  
  const archiveConversation = (id: string) => {
    const updatedConversations = conversations.map(convo => 
      convo.id === id ? { ...convo, isArchived: !convo.isArchived } : convo
    );
    setConversations(updatedConversations.filter(c => !c.isArchived));
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    toast({
      title: "Conversation archived",
      duration: 2000
    });
  };
  
  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(convo => convo.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    
    // Also remove the chat messages
    localStorage.removeItem(`chat_${id}`);
    
    toast({
      title: "Conversation deleted",
      duration: 2000
    });
  };
  
  const muteConversation = (id: string) => {
    const updatedConversations = conversations.map(convo => 
      convo.id === id ? { ...convo, isMuted: !convo.isMuted } : convo
    );
    setConversations(updatedConversations);
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));
    
    toast({
      title: updatedConversations.find(c => c.id === id)?.isMuted 
        ? "Conversation muted" 
        : "Conversation unmuted",
      duration: 2000
    });
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
  
  // Handle swipe gestures using touch events
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeAction, setSwipeAction] = useState<'pin' | 'archive' | null>(null);
  
  const handleSwipeStart = (e: React.TouchEvent, id: string) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipingId(id);
    setSwipeAction(null);
  };
  
  const handleSwipeMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart && touchEnd) {
      const distance = touchEnd - touchStart;
      
      // Determine swipe action based on distance
      if (distance > 50) {
        setSwipeAction('pin');
      } else if (distance < -50) {
        setSwipeAction('archive');
      } else {
        setSwipeAction(null);
      }
    }
  };
  
  const handleSwipeEnd = () => {
    if (!touchStart || !touchEnd || !swipingId) return;
    
    const distance = touchEnd - touchStart;
    
    // Execute action based on swipe direction
    if (distance > 70) {
      // Swipe right - pin
      pinConversation(swipingId);
    } else if (distance < -70) {
      // Swipe left - archive
      archiveConversation(swipingId);
    }
    
    // Reset swipe state
    setTouchStart(null);
    setTouchEnd(null);
    setSwipingId(null);
    setSwipeAction(null);
  };

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
              <li key={conversation.id}
                onTouchStart={() => handleTouchStart(conversation.id)}
                onTouchEnd={handleTouchEnd}
                onTouchStartCapture={(e) => handleSwipeStart(e, conversation.id)}
                onTouchMove={(e) => conversation.id === swipingId && handleSwipeMove(e)}
                onTouchEndCapture={handleSwipeEnd}
              >
                <Link
                  to={`/chats/${conversation.id}`}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors relative",
                    conversation.isPinned && "bg-accent/20",
                    conversation.lastMessage.unread && "bg-accent/30"
                  )}
                  style={{
                    transform: swipingId === conversation.id && touchStart && touchEnd 
                      ? `translateX(${Math.min(Math.max(touchEnd - touchStart, -80), 80)}px)` 
                      : 'translateX(0)',
                    transition: swipingId === conversation.id ? 'none' : 'transform 0.2s ease'
                  }}
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
                        {conversation.user.isTyping 
                          ? <span className="italic text-primary">typing...</span>
                          : getMessageTypePreview(conversation.lastMessage.type, conversation.lastMessage.content)
                        }
                      </p>
                      
                      <div className="flex items-center gap-1">
                        {/* Message status icon - not using lastMessage.status since it doesn't exist in the type */}
                        
                        {(conversation.unreadCount && conversation.unreadCount > 0) && (
                          <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Context menu shown on long press */}
                  <DropdownMenu open={longPressId === conversation.id} onOpenChange={(open) => !open && setLongPressId(null)}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        pinConversation(conversation.id);
                        setLongPressId(null);
                      }}>
                        <Pin className="h-4 w-4 mr-2" />
                        {conversation.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        muteConversation(conversation.id);
                        setLongPressId(null);
                      }}>
                        {conversation.isMuted ? (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <BellOff className="h-4 w-4 mr-2" />
                            Mute
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        archiveConversation(conversation.id);
                        setLongPressId(null);
                      }}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                          setLongPressId(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Link>
                
                {/* Swipe action indicators */}
                {swipingId === conversation.id && swipeAction === 'pin' && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/90 rounded-full p-2">
                    <Pin className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                {swipingId === conversation.id && swipeAction === 'archive' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/90 rounded-full p-2">
                    <Archive className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
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
