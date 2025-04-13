
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthUser, User } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Import refactored components
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { AboutSection } from "@/components/profile/AboutSection";
import { InterestsSection } from "@/components/profile/InterestsSection";
import { ActivityTabs } from "@/components/profile/ActivityTabs";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { CreatePostDialog } from "@/components/profile/CreatePostDialog";

export default function Profile() {
  const [bio, setBio] = useState("Philosophy enthusiast and tech professional. I enjoy deep conversations about consciousness, ethics, and the future of AI. Always up for a good debate or collaborative projects.");
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
  const { user } = useAuth();
  
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [isPostPublic, setIsPostPublic] = useState(true);
  
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setUserData({
        id: user.id,
        name: user.user_metadata?.name || "User",
        email: user.email || "",
        username: user.user_metadata?.username || user.email?.split('@')[0] || "user",
        avatar: user.user_metadata?.avatar_url || "/placeholder.svg",
        isLoggedIn: true,
        createdAt: user.created_at
      });
    }
    
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
    
    const storedProfileData = localStorage.getItem("userProfile");
    if (storedProfileData) {
      try {
        const parsedProfile = JSON.parse(storedProfileData);
        setProfileData(parsedProfile);
        
        if (parsedProfile.bio) {
          setBio(parsedProfile.bio);
        }
        
        if (parsedProfile.interests && parsedProfile.interests.length > 0) {
          setInterests(parsedProfile.interests);
        }

        if (parsedProfile.isPrivate !== undefined) {
          setIsPrivate(parsedProfile.isPrivate);
        }
        
        if (parsedProfile.avatar) {
          setAvatarUrl(parsedProfile.avatar);
        }

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
    
    const storedPosts = localStorage.getItem("userPosts");
    if (storedPosts) {
      try {
        const parsedPosts = JSON.parse(storedPosts);
        setPosts(parsedPosts);
      } catch (error) {
        console.error("Failed to parse posts data", error);
      }
    } else {
      const defaultPosts = [
        {
          id: "p1",
          content: "Just finished reading 'Thinking, Fast and Slow'. Such a mind-opening book about cognitive biases!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          likes: 24,
          comments: 7,
          isPublic: true,
          type: "post"
        },
        {
          id: "p2",
          content: "Organizing a philosophy discussion meetup this Saturday at Golden Gate Park. The topic will be 'Ethics in AI'. Join us!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          likes: 48,
          comments: 12,
          isPublic: true,
          type: "event",
          eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
          eventLocation: "Golden Gate Park, San Francisco"
        },
        {
          id: "p3",
          content: "Working on a new project exploring the intersection of technology and climate change. Looking for collaborators!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
          likes: 36,
          comments: 9,
          isPublic: true,
          type: "post"
        }
      ];
      setPosts(defaultPosts);
      localStorage.setItem("userPosts", JSON.stringify(defaultPosts));
    }
  }, [user]);
  
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
    const currentUser = userData;
    if (currentUser) {
      let conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
      
      const existingConvIndex = conversations.findIndex(
        (conv: any) => conv.user.id === currentUser.id
      );
      
      if (existingConvIndex === -1) {
        const newConversation = {
          id: `conv-${Date.now()}`,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          lastMessage: {
            id: `msg-${Date.now()}`,
            content: "Start a conversation...",
            timestamp: new Date(),
            unread: false
          },
          isApproved: true
        };
        
        conversations.push(newConversation);
        localStorage.setItem("conversations", JSON.stringify(conversations));
      }
    }
    
    navigate(`/chats/${userData?.id || 'new'}`);
    toast({
      title: "Chat opened",
      description: "You can now message this user."
    });
  };
  
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      
      if (profileData) {
        const updatedProfile = { ...profileData, avatar: imageUrl };
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        setProfileData(updatedProfile);
      }
      
      if (userData) {
        const updatedUser = { ...userData, avatar: imageUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully."
      });
    }
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
    if (profileData) {
      const updatedProfile = { 
        ...profileData, 
        ...editProfileData,
        isPrivate: isPrivate,
        avatar: avatarUrl || profileData.avatar
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData(updatedProfile);
      
      if (userData && editProfileData.name) {
        const updatedUser = { 
          ...userData, 
          name: editProfileData.name,
          avatar: avatarUrl || userData.avatar
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
      
      if (editProfileData.bio) {
        setBio(editProfileData.bio);
      }
      
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

  const handleCreatePostClick = () => {
    setPostContent("");
    setPostImage(null);
    setPostImageUrl(null);
    setIsPostPublic(true);
    setCreatePostOpen(true);
  };
  
  const handleCreatePost = () => {
    if (postContent.trim() === '') {
      toast({
        title: "Cannot create post",
        description: "Please enter some content for your post.",
        variant: "destructive"
      });
      return;
    }
    
    const newPost = {
      id: `p-${uuidv4()}`,
      content: postContent,
      image: postImageUrl,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isPublic: isPostPublic,
      type: "post"
    };
    
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("userPosts", JSON.stringify(updatedPosts));
    
    setCreatePostOpen(false);
    toast({
      title: "Post created",
      description: "Your post has been published successfully."
    });
  };
  
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
  
  const handleLoginPage = () => {
    navigate('/auth');
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          avatarUrl={avatarUrl}
          userData={userData}
          profileData={profileData}
          user={user}
          handleProfilePhotoChange={handleProfilePhotoChange}
          handleLoginPage={handleLoginPage}
        />
        
        {/* Profile Info */}
        <ProfileInfo
          userData={userData}
          profileData={profileData}
          isPrivate={isPrivate}
          getAge={getAge}
        />
        
        {/* Profile Actions */}
        <ProfileActions
          isFollowing={isFollowing}
          isPrivate={isPrivate}
          handleFollow={handleFollow}
          handleMessage={handleMessage}
          handleOpenEditProfile={handleOpenEditProfile}
          handleTogglePrivacy={handleTogglePrivacy}
        />
        
        {/* Profile Stats */}
        <ProfileStats
          postsCount={posts.length}
          followers={profileData?.followers}
          following={profileData?.following}
        />
        
        {/* About Section */}
        <AboutSection
          bio={bio}
          setBio={setBio}
          profileData={profileData}
          setProfileData={setProfileData}
        />
        
        {/* Interests Section */}
        <InterestsSection interests={interests} />
        
        {/* Activity Tabs */}
        <ActivityTabs
          posts={posts}
          userData={userData}
          avatarUrl={avatarUrl}
          handleCreatePostClick={handleCreatePostClick}
        />
        
        <div className="text-sm text-muted-foreground border-t pt-6">
          <p>Member since {userData ? format(new Date(userData.createdAt || new Date()), 'MMMM yyyy') : "Recently"}</p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        editProfileData={editProfileData}
        setEditProfileData={setEditProfileData}
        handleSaveProfile={handleSaveProfile}
      />

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        postContent={postContent}
        setPostContent={setPostContent}
        isPostPublic={isPostPublic}
        setIsPostPublic={setIsPostPublic}
        postImageUrl={postImageUrl}
        setPostImageUrl={setPostImageUrl}
        setPostImage={setPostImage}
        handleCreatePost={handleCreatePost}
      />
    </MainLayout>
  );
}
