
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Users,
  Grid3X3,
  Bookmark,
  UserPlus,
  UserCheck,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileViewProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileView({ user, open, onOpenChange }: ProfileViewProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) return null;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You are ${isFollowing ? 'no longer following' : 'now following'} ${user.name}`,
    });
  };

  const handleAddFriend = () => {
    setIsFriend(!isFriend);
    toast({
      title: isFriend ? "Friend removed" : "Friend request sent",
      description: isFriend 
        ? `${user.name} has been removed from your friends`
        : `Friend request sent to ${user.name}`,
    });
  };

  const handleMessage = () => {
    // Create a conversation and navigate to chat
    const newConversation = {
      id: `conv-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || '/placeholder.svg'
      },
      lastMessage: {
        id: 'initial',
        content: '',
        timestamp: new Date(),
        unread: false
      },
      isApproved: true
    };

    // Store in localStorage
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const existingIndex = conversations.findIndex((c: any) => c.id === newConversation.id);
    
    if (existingIndex === -1) {
      conversations.unshift(newConversation);
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }

    navigate(`/chats/${user.id}`);
    onOpenChange(false);
  };

  const mockPosts = [
    { id: 1, image: '/placeholder.svg', likes: 42 },
    { id: 2, image: '/placeholder.svg', likes: 38 },
    { id: 3, image: '/placeholder.svg', likes: 55 },
    { id: 4, image: '/placeholder.svg', likes: 23 },
    { id: 5, image: '/placeholder.svg', likes: 67 },
    { id: 6, image: '/placeholder.svg', likes: 91 }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username || user.name.toLowerCase().replace(' ', '')}</p>
                  {user.location && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={isFriend ? "secondary" : "default"}
                  onClick={handleAddFriend}
                  className="flex items-center gap-2"
                >
                  {isFriend ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFriend ? 'Friends' : 'Add Friend'}
                </Button>
                
                <Button variant="outline" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                
                <Button
                  variant={isFollowing ? "secondary" : "outline"}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>

                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="text-center">
                <div className="font-bold text-lg">{mockPosts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{user.followers || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{user.following || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">156</div>
                <div className="text-sm text-muted-foreground">Friends</div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-4">
                <p className="text-sm">{user.bio}</p>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              <div className="grid grid-cols-3 gap-1 p-1">
                {mockPosts.map((post) => (
                  <Card key={post.id} className="aspect-square cursor-pointer group">
                    <CardContent className="p-0 relative">
                      <img
                        src={post.image}
                        alt={`Post ${post.id}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex items-center text-white">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>F{index + 1}</AvatarFallback>
                        </Avatar>
                        <h4 className="font-medium">Friend {index + 1}</h4>
                        <p className="text-sm text-muted-foreground">@friend{index + 1}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <div className="p-4 text-center text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4" />
                <p>No saved posts yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
