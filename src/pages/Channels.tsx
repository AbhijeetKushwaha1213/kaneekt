
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedChannelCard } from "@/components/ui/enhanced-channel-card";
import { GroupChatDialog } from "@/components/ui/group-chat-dialog";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { PlusCircle, Search } from "lucide-react";

export default function Channels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isGroupChatDialogOpen, setIsGroupChatDialogOpen] = useState(false);

  useEffect(() => {
    const userChannelsString = localStorage.getItem("userChannels");
    const userChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
    const allChannels = [...CHANNELS, ...userChannels];
    setChannels(allChannels);
  }, []);

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case "joined":
        return matchesSearch && channel.isJoined;
      case "public":
        return matchesSearch && !channel.isPrivate;
      case "private":
        return matchesSearch && channel.isPrivate;
      default:
        return matchesSearch;
    }
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Channels</h1>
            <p className="text-muted-foreground mt-1">
              Discover and join community channels
            </p>
          </div>
          <Button onClick={() => setIsGroupChatDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Channel
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredChannels.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No channels found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Be the first to create a channel!"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsGroupChatDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Channel
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map((channel) => (
                  <div key={channel.id} className="relative">
                    <EnhancedChannelCard channel={channel} />
                    {channel.isJoined && (
                      <div className="mt-3 flex gap-2">
                        <Link to={`/enhanced-channels/${channel.id}`} className="flex-1">
                          <Button variant="default" className="w-full">
                            View Channel
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Leave
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <GroupChatDialog 
          open={isGroupChatDialogOpen} 
          onOpenChange={setIsGroupChatDialogOpen}
          onChannelCreated={(newChannel) => {
            setChannels(prev => [...prev, newChannel]);
            setIsGroupChatDialogOpen(false);
          }}
        />
      </div>
    </MainLayout>
  );
}
