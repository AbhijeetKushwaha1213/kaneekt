
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackNavigation } from '@/components/ui/back-navigation';
import { UserPlus, MessageSquare, MoreHorizontal, MapPin, Calendar, Users, Grid, Image, Info, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  posts: number;
  interests: string[];
  joinDate: string;
  isFriend: boolean;
}

export function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    loadProfile();
    checkFriendStatus();
  }, [userId]);

  const checkFriendStatus = () => {
    const friends = JSON.parse(localStorage.getItem('user_friends') || '[]');
    setIsFriend(friends.includes(userId));
  };

  const loadProfile = () => {
    // Mock profile data based on userId
    const mockProfiles: { [key: string]: UserProfile } = {
      'mock-1': {
        id: 'mock-1',
        name: 'Sarah Chen',
        username: 'sarahc',
        avatar: '/placeholder.svg',
        bio: 'Photography enthusiast 📸 | Travel lover ✈️ | Coffee addict ☕ | Love exploring new places and meeting new people!',
        location: 'San Francisco, CA',
        followers: 1247,
        following: 892,
        posts: 156,
        interests: ['Photography', 'Travel', 'Coffee', 'Technology', 'Art', 'Music'],
        joinDate: 'March 2023',
        isFriend: false
      },
      'mock-2': {
        id: 'mock-2',
        name: 'Marcus Johnson',
        username: 'marcusj',
        avatar: '/placeholder.svg',
        bio: 'Music producer 🎵 | Digital artist 🎨 | Always creating something new',
        location: 'Los Angeles, CA',
        followers: 892,
        following: 567,
        posts: 89,
        interests: ['Music', 'Art', 'Technology', 'Design'],
        joinDate: 'January 2023',
        isFriend: false
      },
      'mock-3': {
        id: 'mock-3',
        name: 'Elena Rodriguez',
        username: 'elenar',
        avatar: '/placeholder.svg',
        bio: 'Food blogger 🍜 | World traveler 🌍 | Sharing amazing flavors from around the globe',
        location: 'Miami, FL',
        followers: 2134,
        following: 1045,
        posts: 234,
        interests: ['Travel', 'Food', 'Culture', 'Photography'],
        joinDate: 'May 2022',
        isFriend: false
      },
      'mock-4': {
        id: 'mock-4',
        name: 'David Kim',
        username: 'davidk',
        avatar: '/placeholder.svg',
        bio: 'Gamer 🎮 | Tech enthusiast 💻 | Sports fan ⚽',
        location: 'Seattle, WA',
        followers: 567,
        following: 432,
        posts: 98,
        interests: ['Sports', 'Gaming', 'Technology', 'Fitness'],
        joinDate: 'August 2023',
        isFriend: false
      }
    };

    const mockProfile = mockProfiles[userId || 'mock-1'] || mockProfiles['mock-1'];
    setProfile(mockProfile);
    setLoading(false);
  };

  const handleAddFriend = () => {
    if (!profile) return;
    
    const friends = JSON.parse(localStorage.getItem('user_friends') || '[]');
    let updatedFriends;
    
    if (isFriend) {
      updatedFriends = friends.filter((id: string) => id !== userId);
      toast({
        title: "Friend removed",
        description: `You are no longer friends with ${profile.name}`,
      });
    } else {
      updatedFriends = [...friends, userId];
      toast({
        title: "Friend request sent! 👥",
        description: `Friend request sent to ${profile.name}`,
      });
    }
    
    localStorage.setItem('user_friends', JSON.stringify(updatedFriends));
    setIsFriend(!isFriend);
  };

  const handleMessage = () => {
    navigate(`/chats/${userId}`);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <BackNavigation fallbackRoute="/discover" />
        </div>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
          <p className="text-muted-foreground mb-2">@{profile.username}</p>
          
          {profile.bio && (
            <p className="text-sm mb-4 max-w-md mx-auto leading-relaxed">{profile.bio}</p>
          )}
          
          <div className="flex items-center justify-center gap-4 mb-4 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {profile.joinDate}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold">{profile.posts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{profile.followers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{profile.following.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <Button 
              onClick={handleAddFriend} 
              className="flex-1 max-w-32"
              variant={isFriend ? "outline" : "default"}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFriend ? 'fill-current' : ''}`} />
              {isFriend ? 'Friends' : 'Add Friend'}
            </Button>
            <Button variant="outline" onClick={handleMessage} className="flex-1 max-w-32">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm">Sample post content for {profile.name}...</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>2 hours ago</span>
                      <span>•</span>
                      <span>24 likes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                ></div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    About {profile.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio || 'No bio available'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h4>
                  <p className="text-sm text-muted-foreground">{profile.location}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </h4>
                  <p className="text-sm text-muted-foreground">{profile.joinDate}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Activity</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">{profile.posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">{profile.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">{profile.following}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
