import { useState, useEffect } from "react";
import { Camera, Edit, MapPin, Calendar, Plus, Settings, UserPlus, MessagesSquare, Lock, Globe, Users, UserCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { InterestBadge } from "@/components/ui/interest-badge";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { AuthUser, User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [bio, setBio] = useState("Philosophy enthusiast and tech professional. I enjoy deep conversations about consciousness, ethics, and the future of AI. Always up for a good debate or collaborative projects.");
  const [editingBio, setEditingBio] = useState(false);
  const [interests, setInterests] = useState([
    "Philosophy", "Technology", "Ethics", "Artificial Intelligence", 
    "Psychology", "Climate Change", "Literature"
  ]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<User>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get authenticated user from localStorage
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  
  useEffect(() => {
    // Load user data from localStorage on component mount
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
    
    // Load profile data from localStorage if available
    const storedProfileData = localStorage.getItem("userProfile");
    if (storedProfileData) {
      try {
        const parsedProfile = JSON.parse(storedProfileData);
        setProfileData(parsedProfile);
        
        // Set bio if available
        if (parsedProfile.bio) {
          setBio(parsedProfile.bio);
        }
        
        // Set interests if available
        if (parsedProfile.interests && parsedProfile.interests.length > 0) {
          setInterests(parsedProfile.interests);
        }

        // Initialize edit profile data
        setEditProfileData({
          name: parsedProfile.name,
          location: parsedProfile.location,
          gender: parsedProfile.gender,
          dob: parsedProfile.dob,
          bio: parsedProfile.bio,
          interests: parsedProfile.interests
        });
      } catch (error) {
        console.error("Failed to parse profile data", error);
      }
    }
  }, []);
  
  // Mock posts data
  const posts = [
    {
      id: "p1",
      content: "Just finished reading 'Thinking, Fast and Slow'. Such a mind-opening book about cognitive biases!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      likes: 24,
      comments: 7,
      isPublic: true,
      type: "post"
    },
    {
      id: "p2",
      content: "Organizing a philosophy discussion meetup this Saturday at Golden Gate Park. The topic will be 'Ethics in AI'. Join us!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      likes: 48,
      comments: 12,
      isPublic: true,
      type: "event",
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // in 2 days
      eventLocation: "Golden Gate Park, San Francisco"
    },
    {
      id: "p3",
      content: "Working on a new project exploring the intersection of technology and climate change. Looking for collaborators!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
      likes: 36,
      comments: 9,
      isPublic: true,
      type: "post"
    }
  ];
  
  const handleSaveBio = () => {
    setEditingBio(false);
    // Save bio to localStorage if profile data exists
    if (profileData) {
      const updatedProfile = { ...profileData, bio };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData(updatedProfile);
    }
    toast({
      title: "Profile updated",
      description: "Your bio has been updated successfully."
    });
  };
  
  const handleTogglePrivacy = () => {
    setIsPrivate(!isPrivate);
    toast({
      title: isPrivate ? "Profile is now public" : "Profile is now private",
      description: isPrivate 
        ? "Everyone can now see your posts and activity." 
        : "Only approved followers can now see your posts and activity."
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? "You are no longer following this user." 
        : "You're now following this user. You'll see their updates in your feed."
    });
  };
  
  const handleMessage = () => {
    // Navigate to chat section
    navigate("/chats");
    toast({
      title: "Chat opened",
      description: "You can now message this user."
    });
  };
  
  const handleOpenEditProfile = () => {
    if (profileData) {
      setEditProfileData({
        name: profileData.name,
        location: profileData.location,
        gender: profileData.gender,
        dob: profileData.dob,
        bio: profileData.bio,
        interests: profileData.interests
      });
    }
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    // Save updated profile data to localStorage
    if (profileData) {
      const updatedProfile = { ...profileData, ...editProfileData };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData(updatedProfile);
      
      // Update user data if necessary
      if (userData && editProfileData.name) {
        const updatedUser = { ...userData, name: editProfileData.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
      
      // Update bio if it was changed
      if (editProfileData.bio) {
        setBio(editProfileData.bio);
      }
      
      // Update interests if they were changed
      if (editProfileData.interests) {
        setInterests(editProfileData.interests);
      }
    }
    
    setEditProfileOpen(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
  };
  
  // Calculate age from DOB if available
  const getAge = () => {
    if (profileData?.dob) {
      const birthDate = new Date(profileData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        {/* Profile header */}
        <div className="relative rounded-xl overflow-hidden">
          {/* Cover photo */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 to-accent/30 relative">
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-4 right-4"
              aria-label="Edit cover photo"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
          
          {/* Profile photo */}
          <div className="absolute left-8 md:left-10 -bottom-16 md:-bottom-20">
            <div className="relative">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background">
                <AvatarImage src={userData?.avatar || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-4xl">{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-2 right-2 rounded-full shadow-md"
                aria-label="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Profile actions */}
          <div className="absolute right-4 bottom-4 md:bottom-6 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm"
              onClick={handleOpenEditProfile}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm"
              onClick={handleTogglePrivacy}
            >
              {isPrivate ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Public
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="mt-20 md:pl-44 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{userData?.name || "User"}</h1>
              {isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-muted-foreground">@{userData?.username || "username"}</p>
            <div className="flex items-center gap-3 text-muted-foreground mt-1 flex-wrap">
              {profileData?.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profileData.location}
                </div>
              )}
              {getAge() && (
                <>
                  <span>•</span>
                  <div>{getAge()} years old</div>
                </>
              )}
              {profileData?.gender && (
                <>
                  <span>•</span>
                  <div>{profileData.gender}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 gap-3">
            <Button 
              variant={isFollowing ? "secondary" : "default"} 
              size="sm"
              onClick={handleFollow}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMessage}
            >
              <MessagesSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex border rounded-lg divide-x">
          <div className="flex-1 p-4 text-center">
            <div className="text-2xl font-bold">{posts.length}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="flex-1 p-4 text-center">
            <div className="text-2xl font-bold">{profileData?.followers || 0}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="flex-1 p-4 text-center">
            <div className="text-2xl font-bold">{profileData?.following || 0}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
        </div>
        
        {/* Bio */}
        <Card className="relative">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-medium">About Me</h2>
              {!editingBio && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingBio(true)}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border rounded-md h-32 resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingBio(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveBio}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{bio}</p>
            )}
          </CardContent>
        </Card>
        
        {/* Interests */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Interests</h2>
              <Button variant="ghost" size="sm" className="h-8">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <InterestBadge key={interest} label={interest} />
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-7 px-3"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-lg font-medium">Activity</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
          
          <TabsContent value="posts" className="mt-2 space-y-4">
            {posts.filter(post => post.type === 'post').length > 0 ? (
              posts
                .filter(post => post.type === 'post')
                .map(post => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userData?.avatar || "/placeholder.svg"} alt={userData?.name || "User"} />
                          <AvatarFallback>{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{userData?.name || "User"}</h3>
                              <p className="text-xs text-muted-foreground">
                                {format(post.timestamp, 'MMM d, yyyy')} • {post.isPublic ? 'Public' : 'Private'}
                              </p>
                            </div>
                            <Badge variant={post.isPublic ? "outline" : "secondary"} className="ml-2">
                              {post.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                              {post.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                          
                          <p className="mt-2">{post.content}</p>
                          
                          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{post.likes} likes</div>
                            <div>{post.comments} comments</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Share your thoughts, ideas, or questions with your followers
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="mt-2 space-y-4">
            {posts.filter(post => post.type === 'event').length > 0 ? (
              posts
                .filter(post => post.type === 'event')
                .map(post => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userData?.avatar || "/placeholder.svg"} alt={userData?.name || "User"} />
                          <AvatarFallback>{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{userData?.name || "User"}</h3>
                              <p className="text-xs text-muted-foreground">
                                Posted on {format(post.timestamp, 'MMM d, yyyy')} • Event
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              <Calendar className="h-3 w-3 mr-1" />
                              Event
                            </Badge>
                          </div>
                          
                          <p className="mt-2">{post.content}</p>
                          
                          {post.eventDate && post.eventLocation && (
                            <div className="mt-3 p-3 bg-accent/30 rounded-md space-y-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium">{format(post.eventDate, 'EEEE, MMMM d, yyyy - h:mm a')}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                <span>{post.eventLocation}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div>{post.likes} interested</div>
                              <div>{post.comments} comments</div>
                            </div>
                            <Button size="sm" variant="outline">
                              Interested
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No events yet</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Create events to connect with people who share your interests
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="channels" className="mt-2">
            <Card>
              <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No channels joined</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Join channels to connect with people who share your interests
                </p>
                <Button asChild>
                  <Link to="/channels">
                    Explore Channels
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Account info */}
        <div className="text-sm text-muted-foreground border-t pt-6">
          <p>Member since {userData ? format(new Date(userData.createdAt || new Date()), 'MMMM yyyy') : "Recently"}</p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editProfileData.name || ''}
                onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editProfileData.location || ''}
                onChange={(e) => setEditProfileData({...editProfileData, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Input
                id="gender"
                value={editProfileData.gender || ''}
                onChange={(e) => setEditProfileData({...editProfileData, gender: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={editProfileData.dob || ''}
                onChange={(e) => setEditProfileData({...editProfileData, dob: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <textarea
                id="bio"
                value={editProfileData.bio || ''}
                onChange={(e) => setEditProfileData({...editProfileData, bio: e.target.value})}
                className="col-span-3 p-2 border rounded-md h-24 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveProfile}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
