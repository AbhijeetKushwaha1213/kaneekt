
import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { ChannelCard } from "@/components/ui/channel-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Globe, Server, ChevronDown, Hash, Users, User, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InterestBadge } from "@/components/ui/interest-badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

// Channel categories
const CHANNEL_CATEGORIES = [
  "Gaming",
  "Technology",
  "Books",
  "Music",
  "Art",
  "Education",
  "Fitness",
  "Food",
  "Travel",
  "Movies",
  "Science",
  "Other"
];

export default function Channels() {
  const navigate = useNavigate();
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(CHANNELS);
  const [myChannels, setMyChannels] = useState<Channel[]>([]);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<Channel>>({
    name: "",
    description: "",
    tags: [],
    isPrivate: false,
    type: 'text',
    ownerId: "user-1", // Assuming current user id, in a real app this would come from auth context
    category: "Other",
    visibility: "public"
  });
  const [tempTag, setTempTag] = useState("");
  const [isMyChannelsOpen, setIsMyChannelsOpen] = useState(true);
  const [isPublicChannelsOpen, setIsPublicChannelsOpen] = useState(true);
  const { toast } = useToast();
  
  // Load channels from localStorage on component mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('userChannels');
    if (savedChannels) {
      const parsedChannels = JSON.parse(savedChannels);
      setMyChannels(parsedChannels);
      // Merge with the existing channels
      setFilteredChannels([...parsedChannels, ...CHANNELS]);
    }
  }, []);

  const handleSearch = (filters: any) => {
    // Apply filters to the channels data
    let results = [...CHANNELS, ...myChannels];
    
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
      id: `c${new Date().getTime()}`,
      name: newChannel.name,
      description: newChannel.description,
      members: 1, // Current user
      tags: newChannel.tags || [],
      isPrivate: newChannel.visibility === "private" || newChannel.visibility === "invite",
      inviteOnly: newChannel.visibility === "invite",
      ownerId: "user-1", // Assuming current user id
      createdAt: new Date(),
      type: newChannel.type || 'text',
      category: newChannel.category || "Other"
    };

    // Add to myChannels list
    const updatedMyChannels = [...myChannels, createdChannel];
    setMyChannels(updatedMyChannels);
    
    // Save to localStorage for persistence
    localStorage.setItem('userChannels', JSON.stringify(updatedMyChannels));

    // Update filtered channels to include the new one
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
      isPrivate: false,
      type: 'text',
      ownerId: "user-1",
      category: "Other",
      visibility: "public"
    });
    setIsCreatingChannel(false);
    
    // Navigate to the new channel
    navigate(`/channels/${createdChannel.id}`);
  };

  const handleDeleteChannel = (channelId: string) => {
    // Filter out the deleted channel
    const updatedMyChannels = myChannels.filter(channel => channel.id !== channelId);
    setMyChannels(updatedMyChannels);
    
    // Update filtered channels
    setFilteredChannels(filteredChannels.filter(channel => channel.id !== channelId));
    
    // Update localStorage
    localStorage.setItem('userChannels', JSON.stringify(updatedMyChannels));
    
    toast({
      title: "Channel deleted",
      description: "Your channel has been deleted successfully."
    });
  };
  
  const handleChannelClick = (channelId: string) => {
    navigate(`/channels/${channelId}`);
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
                  <Label htmlFor="channel-category">Category</Label>
                  <Select 
                    value={newChannel.category} 
                    onValueChange={(value) => setNewChannel({...newChannel, category: value})}
                  >
                    <SelectTrigger className="w-full" id="channel-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Channel Type</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={newChannel.type === 'text' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({...newChannel, type: 'text'})}
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={newChannel.type === 'voice' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({...newChannel, type: 'voice'})}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Voice
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant={newChannel.visibility === 'public' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({...newChannel, visibility: 'public'})}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={newChannel.visibility === 'private' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({...newChannel, visibility: 'private'})}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Private
                    </Button>
                    <Button
                      type="button"
                      variant={newChannel.visibility === 'invite' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({...newChannel, visibility: 'invite'})}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Invite-only
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags (interests)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a tag" 
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
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
            
            {/* Discord-like server/channel listing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar with categories */}
              <div className="lg:col-span-3 border rounded-lg p-3 space-y-2">
                {/* My Channels Section */}
                <Collapsible open={isMyChannelsOpen} onOpenChange={setIsMyChannelsOpen}>
                  <CollapsibleTrigger className="flex w-full justify-between items-center px-2 py-1.5 hover:bg-muted rounded">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">MY CHANNELS</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-2 mt-1">
                    {myChannels.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-1">
                        No channels created yet
                      </p>
                    ) : (
                      myChannels.map(channel => (
                        <div 
                          key={channel.id} 
                          className="flex justify-between items-center px-2 py-1 hover:bg-muted rounded text-sm group cursor-pointer"
                          onClick={() => handleChannelClick(channel.id)}
                        >
                          <div className="flex items-center overflow-hidden">
                            {channel.type === 'text' ? (
                              <Hash className="h-4 w-4 mr-1.5 shrink-0" />
                            ) : (
                              <Users className="h-4 w-4 mr-1.5 shrink-0" />
                            )}
                            <span className="truncate">{channel.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChannel(channel.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))
                    )}
                    <div className="px-2 py-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-xs h-7"
                        onClick={() => setIsCreatingChannel(true)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create Channel
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Public Channels Section */}
                <Collapsible open={isPublicChannelsOpen} onOpenChange={setIsPublicChannelsOpen}>
                  <CollapsibleTrigger className="flex w-full justify-between items-center px-2 py-1.5 hover:bg-muted rounded">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">PUBLIC CHANNELS</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-2 mt-1">
                    {CHANNELS.slice(0, 5).map(channel => (
                      <div 
                        key={channel.id} 
                        className="flex items-center px-2 py-1 hover:bg-muted rounded text-sm cursor-pointer"
                        onClick={() => handleChannelClick(channel.id)}
                      >
                        {channel.type === 'voice' ? (
                          <Users className="h-4 w-4 mr-1.5" />
                        ) : (
                          <Hash className="h-4 w-4 mr-1.5" />
                        )}
                        <span className="truncate">{channel.name}</span>
                      </div>
                    ))}
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      + {CHANNELS.length - 5} more channels
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Categories Section */}
                <div className="pt-2">
                  <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">CATEGORIES</h3>
                  <div className="space-y-1 mt-1 pl-2">
                    {CHANNEL_CATEGORIES.slice(0, 6).map(category => (
                      <div key={category} className="flex items-center px-2 py-1 hover:bg-muted rounded text-sm cursor-pointer">
                        <span className="truncate">{category}</span>
                      </div>
                    ))}
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      + more categories
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main content with channel cards */}
              <div className="lg:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredChannels.map((channel, index) => (
                    <div 
                      key={channel.id}
                      className="cursor-pointer"
                      onClick={() => handleChannelClick(channel.id)}
                    >
                      <ChannelCard 
                        channel={channel}
                        onDelete={channel.ownerId === "user-1" ? handleDeleteChannel : undefined}
                        className={`animate-in fade-in-up stagger-${(index % 5) + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
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
