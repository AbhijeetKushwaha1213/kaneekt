
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/types";

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();
  
  // Load conversations from localStorage
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
      } catch (error) {
        console.error("Failed to parse conversations", error);
        // If parsing fails, provide fallback empty conversations array
        setConversations([]);
      }
    } else {
      // If no conversations found, set empty array
      setConversations([]);
    }
  }, []);
  
  const filteredConversations = conversations.filter(
    convo => convo.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToDiscoverPage = () => {
    navigate("/discover");
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
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
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
