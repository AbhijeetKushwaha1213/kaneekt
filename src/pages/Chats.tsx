
import { ConversationList } from "@/components/ConversationList";
import { MainLayout } from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export default function Chats() {
  const location = useLocation();
  const isSpecificChat = location.pathname.includes("/chats/");
  
  return (
    <MainLayout>
      <div className={cn(
        "h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-3.5rem)] flex",
        isSpecificChat ? "hidden md:flex" : "flex"
      )}>
        {/* Conversations sidebar */}
        <div className={cn(
          "border-r",
          isSpecificChat ? "hidden md:block md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
        )}>
          <ConversationList />
        </div>
        
        {/* Empty state for chat when no conversation is selected */}
        {!isSpecificChat && (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-4 bg-accent/10">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a chat from the list or start a new conversation with someone you've connected with.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Add padding at the bottom to account for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
