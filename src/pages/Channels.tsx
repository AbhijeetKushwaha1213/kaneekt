
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedChannelCard } from "@/components/ui/enhanced-channel-card";
import { ChannelActions } from "@/components/ui/channel-actions";
import { GroupChatDialog } from "@/components/ui/group-chat-dialog";
import { useChannels } from "@/hooks/useChannels";
import { PlusCircle, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Channels() {
  const { channels, userChannels, loading, createChannel, joinChannel, leaveChannel } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isGroupChatDialogOpen, setIsGroupChatDialogOpen] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Combine all channels with user membership status
  const allChannels = channels.map(channel => ({
    ...channel,
    isJoined: userChannels.some(uc => uc.id === channel.id),
    members: channel.member_count || 0
  }));

  const filteredChannels = allChannels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (channel.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case "joined":
        return matchesSearch && channel.isJoined;
      case "public":
        return matchesSearch && !channel.is_private;
      case "private":
        return matchesSearch && channel.is_private;
      default:
        return matchesSearch;
    }
  });

  const handleChannelCreated = async (groupData: {
    id: string;
    name: string;
    description: string;
    participants: {
      id: string;
      name: string;
      avatar?: string;
      role: 'admin' | 'member';
    }[];
  }) => {
    // Create channel using the backend
    const result = await createChannel({
      name: groupData.name,
      description: groupData.description,
      is_private: false,
      invite_only: false,
      category: 'General',
      tags: []
    });
    
    if (result?.data) {
      setIsGroupChatDialogOpen(false);
    }
  };

  // Convert User to AuthUser format
  const authUser = user ? {
    id: user.id,
    email: user.email || '',
    username: user.user_metadata?.username || user.email?.split('@')[0] || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    avatar: user.user_metadata?.avatar_url,
    isLoggedIn: true
  } : null;

  if (loading) {
    return (
      <MainLayout>
        <div className={cn(
          "container mx-auto max-w-6xl",
          isMobile ? "px-3 py-4" : "px-4 py-6"
        )}>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading channels...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={cn(
        "container mx-auto max-w-6xl",
        isMobile ? "px-3 py-4" : "px-4 py-6"
      )}>
        <div className={cn(
          "flex justify-between items-start gap-4 mb-6",
          isMobile ? "flex-col" : "flex-col sm:flex-row sm:items-center"
        )}>
          <div>
            <h1 className={cn("font-bold", isMobile ? "text-2xl" : "text-3xl")}>
              Channels
            </h1>
            <p className={cn("text-muted-foreground mt-1", isMobile ? "text-sm" : "")}>
              Discover and join community channels
            </p>
          </div>
          <Button 
            onClick={() => setIsGroupChatDialogOpen(true)}
            className={cn(isMobile ? "w-full" : "")}
            size={isMobile ? "default" : "default"}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Channel
          </Button>
        </div>

        <div className={cn("flex gap-4 mb-6", isMobile ? "flex-col" : "flex-col sm:flex-row")}>
          <div className="relative flex-1">
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
              isMobile ? "h-4 w-4" : "h-4 w-4"
            )} />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-10", isMobile ? "text-base" : "")}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={cn(
            "grid w-full grid-cols-4",
            isMobile ? "max-w-full h-12" : "max-w-md"
          )}>
            <TabsTrigger value="all" className={cn(isMobile ? "text-xs" : "")}>
              All
            </TabsTrigger>
            <TabsTrigger value="joined" className={cn(isMobile ? "text-xs" : "")}>
              Joined
            </TabsTrigger>
            <TabsTrigger value="public" className={cn(isMobile ? "text-xs" : "")}>
              Public
            </TabsTrigger>
            <TabsTrigger value="private" className={cn(isMobile ? "text-xs" : "")}>
              Private
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredChannels.length === 0 ? (
              <div className={cn("text-center", isMobile ? "py-8" : "py-12")}>
                <h3 className={cn("font-medium mb-2", isMobile ? "text-base" : "text-lg")}>
                  No channels found
                </h3>
                <p className={cn("text-muted-foreground mb-4", isMobile ? "text-sm" : "")}>
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Be the first to create a channel!"
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsGroupChatDialogOpen(true)}
                    className={cn(isMobile ? "w-full max-w-xs" : "")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Channel
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                isMobile 
                  ? "grid-cols-1" 
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {filteredChannels.map((channel) => (
                  <div key={channel.id} className="space-y-4">
                    <EnhancedChannelCard channel={channel} />
                    <ChannelActions 
                      channel={channel}
                      isJoined={channel.isJoined || false}
                      onJoin={() => joinChannel(channel.id)}
                      onLeave={() => leaveChannel(channel.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <GroupChatDialog 
          open={isGroupChatDialogOpen} 
          onOpenChange={setIsGroupChatDialogOpen}
          onGroupCreate={handleChannelCreated}
          currentUser={authUser}
        />
      </div>
    </MainLayout>
  );
}
