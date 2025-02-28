
import { useState } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { ChannelCard } from "@/components/ui/channel-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InterestBadge } from "@/components/ui/interest-badge";
import { useToast } from "@/hooks/use-toast";

export default function Channels() {
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(CHANNELS);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<Channel>>({
    name: "",
    description: "",
    tags: [],
    isPrivate: false
  });
  const [tempTag, setTempTag] = useState("");
  const { toast } = useToast();
  
  const handleSearch = (filters: any) => {
    // Apply filters to the channels data
    let results = [...CHANNELS];
    
    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        channel => 
          channel.name.toLowerCase().includes(query) ||
          channel.description.toLowerCase().includes(query) ||
          channel.tags.some(tag => 
            tag.toLowerCase().includes(query)
          )
      );
    }
    
    // Filter by interests/tags
    if (filters.interests && filters.interests.length > 0) {
      results = results.filter(
        channel => filters.interests.some((interest: string) => 
          channel.tags.includes(interest)
        )
      );
    }
    
    setFilteredChannels(results);
  };

  const handleAddTag = () => {
    if (tempTag && !newChannel.tags?.includes(tempTag)) {
      setNewChannel({
        ...newChannel,
        tags: [...(newChannel.tags || []), tempTag]
      });
      setTempTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewChannel({
      ...newChannel,
      tags: newChannel.tags?.filter(t => t !== tag)
    });
  };

  const handleCreateChannel = () => {
    // Validate form
    if (!newChannel.name || !newChannel.description || !newChannel.tags?.length) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields",
        variant: "destructive"
      });
      return;
    }

    // Create a new channel
    const createdChannel: Channel = {
      id: `c${CHANNELS.length + 1}`,
      name: newChannel.name,
      description: newChannel.description,
      members: 1, // Current user
      tags: newChannel.tags || [],
      isPrivate: newChannel.isPrivate || false
    };

    // In a real app, we would send this to the backend
    // For now, let's just add it to our filtered channels
    setFilteredChannels([createdChannel, ...filteredChannels]);

    // Show success message
    toast({
      title: "Channel created!",
      description: `Your channel "${createdChannel.name}" has been created successfully.`
    });

    // Reset form and close dialog
    setNewChannel({
      name: "",
      description: "",
      tags: [],
      isPrivate: false
    });
    setIsCreatingChannel(false);
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interest Channels</h1>
            <p className="text-muted-foreground">
              Join discussions and meet people in topic-based channels
            </p>
          </div>
          <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
            <DialogTrigger asChild>
              <Button size="sm" className="hidden sm:flex">
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a new channel</DialogTitle>
                <DialogDescription>
                  Create a channel to connect with people who share your interests
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-name">Channel name</Label>
                  <Input 
                    id="channel-name" 
                    placeholder="Philosophy Discussion Group" 
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-description">Description</Label>
                  <Textarea 
                    id="channel-description" 
                    placeholder="A place to discuss philosophical topics and exchange ideas..."
                    value={newChannel.description}
                    onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (interests)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a tag" 
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" onClick={handleAddTag} variant="secondary">
                      Add
                    </Button>
                  </div>
                  {newChannel.tags && newChannel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newChannel.tags.map(tag => (
                        <InterestBadge 
                          key={tag} 
                          label={tag} 
                          selected 
                          onClick={() => handleRemoveTag(tag)}
                          className="pr-2"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-privacy" 
                    checked={newChannel.isPrivate}
                    onCheckedChange={(checked) => 
                      setNewChannel({...newChannel, isPrivate: checked as boolean})
                    }
                  />
                  <Label htmlFor="channel-privacy" className="text-sm font-normal">
                    Make this channel private (invite only)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingChannel(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChannel}>
                  Create Channel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <SearchFilters onSearch={handleSearch} />
        
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No channels found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try adjusting your search filters or create a new channel
            </p>
            <Button onClick={() => setIsCreatingChannel(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </div>
        ) : (
          <>
            <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full flex items-center whitespace-nowrap"
              >
                <Globe className="h-4 w-4 mr-2" />
                All Channels
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full flex items-center whitespace-nowrap"
              >
                <Lock className="h-4 w-4 mr-2" />
                Private Channels
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full whitespace-nowrap"
              >
                My Channels
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full whitespace-nowrap"
              >
                Most Popular
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full whitespace-nowrap"
              >
                Recently Added
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel, index) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel}
                  className={`animate-in fade-in-up stagger-${(index % 5) + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="flex justify-center sm:hidden mt-8">
          <Button onClick={() => setIsCreatingChannel(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
