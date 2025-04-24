
import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { MainLayout } from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroupChatDialog } from "@/components/ui/group-chat-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Chats() {
  const location = useLocation();
  const isSpecificChat = location.pathname.includes("/chats/");
  const { user } = useAuth();
  const { toast } = useToast();
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleCreateGroup = (groupData: any) => {
    // Store the group in localStorage
    const storedConversations = localStorage.getItem("conversations");
    let conversations = [];
    
    if (storedConversations) {
      conversations = JSON.parse(storedConversations);
    }
    
    // Create a new conversation entry for the group
    const newGroupConversation = {
      id: groupData.id,
      user: {
        id: groupData.id,
        name: groupData.name,
        avatar: "/placeholder.svg", // Default group avatar
        isGroup: true
      },
      lastMessage: {
        id: `msg-${Date.now()}`,
        content: "Group created",
        timestamp: new Date(),
        unread: false
      },
      isApproved: true,
      participants: groupData.participants
    };
    
    conversations.push(newGroupConversation);
    localStorage.setItem("conversations", JSON.stringify(conversations));
    
    // Create empty message history for the group
    localStorage.setItem(`chat_${groupData.id}`, JSON.stringify([]));
    
    toast({
      title: "Group created",
      description: `${groupData.name} has been created with ${groupData.participants.length - 1} participants`,
    });
  };
  
  return (
    <MainLayout>
      <div className={cn(
        "h-[calc(100vh-7.5rem)]",
        isMobile ? 
          (isSpecificChat ? "hidden" : "flex") : 
          "lg:h-[calc(100vh-3.5rem)] flex"
      )}>
        {/* Conversations sidebar */}
        <div className={cn(
          "border-r relative",
          isMobile ? 
            "w-full" : 
            (isSpecificChat ? "hidden md:block md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96")
        )}>
          <ConversationList />
          
          {/* Floating action button for creating a new group chat */}
          <div className="absolute bottom-20 right-4 md:bottom-4">
            <Button 
              onClick={() => setGroupDialogOpen(true)}
              variant="secondary" 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Empty state for chat when no conversation is selected */}
        {!isSpecificChat && !isMobile && (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-4 bg-accent/10">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a chat from the list or start a new conversation with someone you've connected with.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => setGroupDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group Chat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Group chat creation dialog */}
      <GroupChatDialog 
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        onGroupCreate={handleCreateGroup}
        currentUser={user ? {
          id: user.id,
          name: user.user_metadata?.name || "User",
          email: user.email || "",
          username: user.user_metadata?.username || user.email?.split('@')[0] || "user",
          avatar: user.user_metadata?.avatar_url || "/placeholder.svg",
          isLoggedIn: true,
          createdAt: user.created_at
        } : null}
      />
      
      {/* Add padding at the bottom to account for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
