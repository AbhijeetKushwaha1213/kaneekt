
import { useState } from "react";
import { Camera, Settings, Grid3X3, Bookmark, Users, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { CreatePostDialog } from "./CreatePostDialog";
import { useToast } from "@/hooks/use-toast";

interface InstagramProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

export function InstagramProfileHeader({
  user,
  isOwnProfile,
  onFollow,
  onMessage
}: InstagramProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPostPublic, setIsPostPublic] = useState(true);
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [posts, setPosts] = useState([
    { id: 1, image: '/placeholder.svg', likes: 42, comments: 8 },
    { id: 2, image: '/placeholder.svg', likes: 38, comments: 12 },
    { id: 3, image: '/placeholder.svg', likes: 55, comments: 5 },
    { id: 4, image: '/placeholder.svg', likes: 23, comments: 15 },
    { id: 5, image: '/placeholder.svg', likes: 67, comments: 20 },
    { id: 6, image: '/placeholder.svg', likes: 91, comments: 33 }
  ]);
  const { toast } = useToast();

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You are ${isFollowing ? 'no longer following' : 'now following'} ${user.name}`,
    });
  };

  const handleMessage = () => {
    onMessage?.();
    toast({
      title: "Opening chat",
      description: `Starting conversation with ${user.name}`,
    });
  };

  const handleCreatePost = () => {
    if (!postContent.trim() && !postImageUrl) return;

    const newPost = {
      id: posts.length + 1,
      image: postImageUrl || '/placeholder.svg',
      likes: 0,
      comments: 0
    };

    setPosts(prev => [newPost, ...prev]);
    
    // Reset form
    setPostContent("");
    setPostImageUrl(null);
    setPostImage(null);
    setIsCreatePostOpen(false);
    
    toast({
      title: "Post created!",
      description: "Your post has been shared successfully.",
    });
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6">
        {/* Profile Picture */}
        <div className="relative">
          <Avatar className="h-32 w-32 md:h-40 md:w-40">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          {isOwnProfile && (
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 rounded-full bg-primary hover:bg-primary/90 h-8 w-8 flex items-center justify-center cursor-pointer border-2 border-background transition-colors"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-light">{user.username || user.name}</h1>
            
            {isOwnProfile ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsCreatePostOpen(true)}
                >
                  Create Post
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className="min-w-[100px]"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                
                <Button variant="outline" onClick={handleMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 mb-4">
            <div className="text-center">
              <span className="font-semibold">{posts.length}</span>
              <span className="text-gray-600 ml-1">posts</span>
            </div>
            <div className="text-center">
              <span className="font-semibold">{user.followers || 0}</span>
              <span className="text-gray-600 ml-1">followers</span>
            </div>
            <div className="text-center">
              <span className="font-semibold">{user.following || 0}</span>
              <span className="text-gray-600 ml-1">following</span>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <h2 className="font-semibold">{user.name}</h2>
            {user.bio && <p className="text-gray-700 mt-1">{user.bio}</p>}
            {user.location && (
              <p className="text-gray-500 text-sm mt-1">{user.location}</p>
            )}
          </div>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 border-t">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">POSTS</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">SAVED</span>
          </TabsTrigger>
          <TabsTrigger value="tagged" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">TAGGED</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <Card key={post.id} className="aspect-square cursor-pointer group overflow-hidden">
                  <CardContent className="p-0 relative h-full">
                    <img
                      src={post.image}
                      alt={`Post ${post.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center text-white gap-4">
                        <div className="flex items-center">
                          <span className="font-semibold">{post.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-light mb-2">Share Photos</h3>
              <p className="text-gray-500">When you share photos, they will appear on your profile.</p>
              {isOwnProfile && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreatePostOpen(true)}
                >
                  Share your first photo
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-light mb-2">Save</h3>
            <p className="text-gray-500">Save photos and videos that you want to see again.</p>
          </div>
        </TabsContent>

        <TabsContent value="tagged" className="mt-0">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-light mb-2">Photos of you</h3>
            <p className="text-gray-500">When people tag you in photos, they'll appear here.</p>
          </div>
        </TabsContent>
      </Tabs>

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        postContent={postContent}
        setPostContent={setPostContent}
        isPostPublic={isPostPublic}
        setIsPostPublic={setIsPostPublic}
        postImageUrl={postImageUrl}
        setPostImageUrl={setPostImageUrl}
        setPostImage={setPostImage}
        handleCreatePost={handleCreatePost}
      />
    </div>
  );
}
