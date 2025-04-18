
import React, { useState, useEffect } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { EnhancedChannelCard } from "@/components/ui/enhanced-channel-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Plus, Lock, Globe, Server, ChevronDown, Hash, 
  Users, User, Settings, Trash2, Filter, 
  TrendingUp, Gamepad, BookOpen, MapPin, Compass,
  Star, Bookmark, Flame, Search, LayoutGrid, LayoutList,
  Clock
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// Interest tags for filtering
const INTEREST_TAGS = [
  { id: "trending", label: "Trending", icon: <TrendingUp className="h-3.5 w-3.5 mr-1" /> },
  { id: "gaming", label: "Gaming", icon: <Gamepad className="h-3.5 w-3.5 mr-1" /> },
  { id: "learning", label: "Learning", icon: <BookOpen className="h-3.5 w-3.5 mr-1" /> },
  { id: "local", label: "Local", icon: <MapPin className="h-3.5 w-3.5 mr-1" /> },
  { id: "tech", label: "Tech", icon: <Server className="h-3.5 w-3.5 mr-1" /> },
  { id: "music", label: "Music", icon: <Hash className="h-3.5 w-3.5 mr-1" /> },
  { id: "art", label: "Art", icon: <Hash className="h-3.5 w-3.5 mr-1" /> },
  { id: "sports", label: "Sports", icon: <Hash className="h-3.5 w-3.5 mr-1" /> },
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
    ownerId: "user-1", // Assuming current user id
    category: "Other",
    visibility: "public"
  });
  const [tempTag, setTempTag] = useState("");
  const [isMyChannelsOpen, setIsMyChannelsOpen] = useState(true);
  const [isPublicChannelsOpen, setIsPublicChannelsOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [savedChannels, setSavedChannels] = useState<string[]>([]);
  const [mutedChannels, setMutedChannels] = useState<string[]>([]);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Load channels from localStorage on component mount
  useEffect(() => {
    const savedChannels = localStorage.getItem('userChannels');
    if (savedChannels) {
      const parsedChannels = JSON.parse(savedChannels);
      setMyChannels(parsedChannels);
      // Add user created channels to joined channels
      setJoinedChannels(parsedChannels.map((channel: Channel) => channel.id));
      // Merge with the existing channels
      setFilteredChannels([...parsedChannels, ...CHANNELS]);
    }
    
    // Load saved preferences
    const saved = localStorage.getItem('savedChannels');
    if (saved) setSavedChannels(JSON.parse(saved));
    
    const muted = localStorage.getItem('mutedChannels');
    if (muted) setMutedChannels(JSON.parse(muted));
    
    const joined = localStorage.getItem('joinedChannels');
    if (joined) {
      const parsed = JSON.parse(joined);
      setJoinedChannels(prev => [...new Set([...prev, ...parsed])]);
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

  const filterChannelsByTab = (channels: Channel[]) => {
    switch (activeTab) {
      case "my":
        return channels.filter(channel => joinedChannels.includes(channel.id));
      case "private":
        return channels.filter(channel => channel.isPrivate);
      case "popular":
        return [...channels].sort((a, b) => b.members - a.members);
      case "recent":
        return [...channels].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case "saved":
        return channels.filter(channel => savedChannels.includes(channel.id));
      default:
        return channels;
    }
  };

  const filterChannelsByInterests = (channels: Channel[]) => {
    if (activeInterests.length === 0) return channels;
    
    return channels.filter(channel => 
      // If channel has any of the active interest tags
      channel.tags.some(tag => 
        activeInterests.includes(tag.toLowerCase())
      )
    );
  };

  const getDisplayedChannels = () => {
    let result = filteredChannels;
    result = filterChannelsByTab(result);
    result = filterChannelsByInterests(result);
    return result;
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

    // Add to joined channels
    const updatedJoinedChannels = [...joinedChannels, createdChannel.id];
    setJoinedChannels(updatedJoinedChannels);
    localStorage.setItem('joinedChannels', JSON.stringify(updatedJoinedChannels));

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
    
    // Remove from joined channels
    const updatedJoinedChannels = joinedChannels.filter(id => id !== channelId);
    setJoinedChannels(updatedJoinedChannels);
    localStorage.setItem('joinedChannels', JSON.stringify(updatedJoinedChannels));
    
    // Remove from saved channels if needed
    if (savedChannels.includes(channelId)) {
      const updatedSavedChannels = savedChannels.filter(id => id !== channelId);
      setSavedChannels(updatedSavedChannels);
      localStorage.setItem('savedChannels', JSON.stringify(updatedSavedChannels));
    }
    
    // Remove from muted channels if needed
    if (mutedChannels.includes(channelId)) {
      const updatedMutedChannels = mutedChannels.filter(id => id !== channelId);
      setMutedChannels(updatedMutedChannels);
      localStorage.setItem('mutedChannels', JSON.stringify(updatedMutedChannels));
    }
    
    toast({
      title: "Channel deleted",
      description: "Your channel has been deleted successfully."
    });
  };
  
  const handleJoinChannel = (channelId: string) => {
    if (joinedChannels.includes(channelId)) {
      // Leave channel
      const updatedJoinedChannels = joinedChannels.filter(id => id !== channelId);
      setJoinedChannels(updatedJoinedChannels);
      localStorage.setItem('joinedChannels', JSON.stringify(updatedJoinedChannels));
      
      toast({
        title: "Left channel",
        description: "You've left the channel successfully."
      });
    } else {
      // Join channel
      const updatedJoinedChannels = [...joinedChannels, channelId];
      setJoinedChannels(updatedJoinedChannels);
      localStorage.setItem('joinedChannels', JSON.stringify(updatedJoinedChannels));
      
      toast({
        title: "Joined channel",
        description: "You've joined the channel successfully."
      });
    }
  };
  
  const handleSaveChannel = (channelId: string) => {
    if (savedChannels.includes(channelId)) {
      // Unsave channel
      const updatedSavedChannels = savedChannels.filter(id => id !== channelId);
      setSavedChannels(updatedSavedChannels);
      localStorage.setItem('savedChannels', JSON.stringify(updatedSavedChannels));
      
      toast({
        title: "Unsaved channel",
        description: "Channel removed from your saved list."
      });
    } else {
      // Save channel
      const updatedSavedChannels = [...savedChannels, channelId];
      setSavedChannels(updatedSavedChannels);
      localStorage.setItem('savedChannels', JSON.stringify(updatedSavedChannels));
      
      toast({
        title: "Saved channel",
        description: "Channel added to your saved list."
      });
    }
  };
  
  const handleMuteChannel = (channelId: string) => {
    if (mutedChannels.includes(channelId)) {
      // Unmute channel
      const updatedMutedChannels = mutedChannels.filter(id => id !== channelId);
      setMutedChannels(updatedMutedChannels);
      localStorage.setItem('mutedChannels', JSON.stringify(updatedMutedChannels));
      
      toast({
        title: "Unmuted channel",
        description: "You'll now receive notifications from this channel."
      });
    } else {
      // Mute channel
      const updatedMutedChannels = [...mutedChannels, channelId];
      setMutedChannels(updatedMutedChannels);
      localStorage.setItem('mutedChannels', JSON.stringify(updatedMutedChannels));
      
      toast({
        title: "Muted channel",
        description: "You won't receive notifications from this channel."
      });
    }
  };
  
  const toggleInterestFilter = (interest: string) => {
    if (activeInterests.includes(interest)) {
      setActiveInterests(activeInterests.filter(i => i !== interest));
    } else {
      setActiveInterests([...activeInterests, interest]);
    }
  };
  
  const renderNoChannelsFound = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted/50 rounded-full p-6 mb-4">
        <Compass className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No channels found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Try adjusting your search filters or create a new channel to get started
      </p>
      <Button onClick={() => setIsCreatingChannel(true)} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create Channel
      </Button>
    </div>
  );
  
  const renderFeaturedChannel = () => {
    // Show featured channel only on "all" tab
    if (activeTab !== "all" || activeInterests.length > 0) return null;
    
    // Use first channel as featured (in real app would be based on activity/popularity)
    const featuredChannel = CHANNELS[0];
    
    return (
      <Card className="col-span-full mb-4 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/3 p-6">
            <div className="flex items-center mb-4">
              <Badge className="bg-amber-500 text-white mr-2">Featured Channel</Badge>
              {getPrivacyBadge(featuredChannel)}
            </div>
            <h2 className="text-2xl font-bold mb-2">{featuredChannel.name}</h2>
            <p className="text-muted-foreground mb-4">{featuredChannel.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {featuredChannel.tags.map(tag => (
                <InterestBadge key={tag} label={tag} />
              ))}
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2 mr-4">
                <Avatar className="border-2 border-background">
                  <AvatarImage src="https://i.pravatar.cc/150?u=1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarImage src="https://i.pravatar.cc/150?u=2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarImage src="https://i.pravatar.cc/150?u=3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                {featuredChannel.members > 3 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
                    +{featuredChannel.members - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {featuredChannel.members} members
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleJoinChannel(featuredChannel.id)}>
                {joinedChannels.includes(featuredChannel.id) ? "View Channel" : "Join Channel"}
              </Button>
              <Button variant="outline" onClick={() => handleSaveChannel(featuredChannel.id)}>
                {savedChannels.includes(featuredChannel.id) ? (
                  <>
                    <Star className="h-4 w-4 mr-2 fill-amber-500 text-amber-500" />
                    Saved
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-10 text-white">
            <div className="text-center">
              <Flame className="h-16 w-16 mx-auto mb-4" />
              <div className="text-lg font-medium">Most Active Today</div>
              <div className="text-sm opacity-80">Join {featuredChannel.members} others in the conversation</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  const getPrivacyBadge = (channel: Channel) => {
    if (channel.inviteOnly) {
      return (
        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
          <User className="h-3 w-3 mr-1" />
          Invite Only
        </Badge>
      );
    }
    
    if (channel.isPrivate) {
      return (
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        <Globe className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  };
  
  const displayedChannels = getDisplayedChannels();
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interest Channels</h1>
            <p className="text-muted-foreground">
              Join discussions and meet people in topic-based channels
            </p>
          </div>
          <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-sm">
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
        
        <div className="bg-card shadow-sm rounded-lg p-4">
          <SearchFilters onSearch={handleSearch} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-row">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Globe className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="my" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" />
                My Channels
              </TabsTrigger>
              <TabsTrigger value="private" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="h-4 w-4 mr-2" />
                Private
              </TabsTrigger>
              <TabsTrigger value="popular" className="hidden sm:flex data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="recent" className="hidden sm:flex data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="saved" className="hidden sm:flex data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"} 
              size="sm" 
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"} 
              size="sm" 
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {INTEREST_TAGS.map((interest) => (
            <Button
              key={interest.id}
              variant={activeInterests.includes(interest.id) ? "default" : "outline"}
              size="sm"
              className={`rounded-full whitespace-nowrap ${
                activeInterests.includes(interest.id) ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => toggleInterestFilter(interest.id)}
            >
              {interest.icon}
              {interest.label}
            </Button>
          ))}
        </div>
        
        {displayedChannels.length === 0 ? (
          renderNoChannelsFound()
        ) : (
          <TabsContent value={activeTab} className="mt-0 space-y-6">
            {/* Featured Channel (only shown on "all" tab) */}
            {renderFeaturedChannel()}
            
            {/* Grid or List View of Channels */}
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            }>
              {displayedChannels.map((channel) => (
                <EnhancedChannelCard 
                  key={channel.id}
                  channel={channel}
                  currentUserId="user-1"
                  onDelete={channel.ownerId === "user-1" ? handleDeleteChannel : undefined}
                  onJoin={handleJoinChannel}
                  onSave={handleSaveChannel}
                  onMute={handleMuteChannel}
                  isJoined={joinedChannels.includes(channel.id)}
                  isSaved={savedChannels.includes(channel.id)}
                  isMuted={mutedChannels.includes(channel.id)}
                  className={viewMode === "list" ? "h-auto" : ""}
                />
              ))}
            </div>
          </TabsContent>
        )}
      </div>
    </MainLayout>
  );
}
