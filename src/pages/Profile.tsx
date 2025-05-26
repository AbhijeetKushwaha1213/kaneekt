
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthUser, User } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

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
  // Consolidated state to prevent multiple re-renders
  const [profileState, setProfileState] = useState({
    bio: "Philosophy enthusiast and tech professional. I enjoy deep conversations about consciousness, ethics, and the future of AI. Always up for a good debate or collaborative projects.",
    interests: [
      "Philosophy", "Technology", "Ethics", "Artificial Intelligence", 
      "Psychology", "Climate Change", "Literature"
    ],
    isPrivate: false,
    isFollowing: false,
    editProfileOpen: false,
    createPostOpen: false,
    loading: true,
    dataLoaded: false
  });
  
  const [editProfileData, setEditProfileData] = useState<Partial<User>>({});
  const [userData, setUserData] = useState<AuthUser | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Post creation state
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [isPostPublic, setIsPostPublic] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Single data loading effect to prevent shaking
  useEffect(() => {
    if (profileState.dataLoaded) return;

    const loadAllData = async () => {
      console.log("Loading profile data...");
      
      if (user) {
        try {
          // Load user data
          const authUserData = {
            id: user.id,
            name: user.user_metadata?.name || "User",
            email: user.email || "",
            username: user.user_metadata?.username || user.email?.split('@')[0] || "user",
            avatar: user.user_metadata?.avatar_url || "/placeholder.svg",
            isLoggedIn: true,
            createdAt: user.created_at
          };
          setUserData(authUserData);

          // Load profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error loading profile:", profileError);
          }
          
          if (profileData) {
            let age = 0;
            if (profileData.dob) {
              const birthDate = new Date(profileData.dob);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }
            
            const completeProfile = {
              ...profileData,
              age: age
            } as User;
            
            setProfileData(completeProfile);
            setAvatarUrl(profileData.avatar || null);
            
            setProfileState(prev => ({
              ...prev,
              bio: profileData.bio || prev.bio,
              interests: profileData.interests || prev.interests,
              isPrivate: profileData.is_private || false,
            }));

            setEditProfileData({
              name: profileData.name,
              location: profileData.location,
              gender: profileData.gender,
              dob: profileData.dob,
              bio: profileData.bio,
              interests: profileData.interests
            });

            // Save to localStorage as backup
            localStorage.setItem("userProfile", JSON.stringify(completeProfile));
            localStorage.setItem("user", JSON.stringify(authUserData));
          }

          // Load posts from Supabase
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (postsError) {
            console.error("Error loading posts:", postsError);
          }
            
          if (postsData && postsData.length > 0) {
            setPosts(postsData);
            localStorage.setItem("userPosts", JSON.stringify(postsData));
          } else {
            // Load default posts if none exist
            loadDefaultPosts();
          }
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
          loadLocalStorageData();
        }
      } else {
        loadLocalStorageData();
      }
      
      setProfileState(prev => ({ ...prev, loading: false, dataLoaded: true }));
    };

    loadAllData();
  }, [user, profileState.dataLoaded]);

  const loadLocalStorageData = () => {
    console.log("Loading from localStorage...");
    
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
    
    const storedProfileData = localStorage.getItem("userProfile");
    if (storedProfileData) {
      try {
        const parsedProfile = JSON.parse(storedProfileData);
        setProfileData(parsedProfile);
        setAvatarUrl(parsedProfile.avatar);
        
        setProfileState(prev => ({
          ...prev,
          bio: parsedProfile.bio || prev.bio,
          interests: parsedProfile.interests || prev.interests,
          isPrivate: parsedProfile.isPrivate || false
        }));

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
        setPosts(JSON.parse(storedPosts));
      } catch (error) {
        console.error("Failed to parse posts data", error);
        loadDefaultPosts();
      }
    } else {
      loadDefaultPosts();
    }
  };

  const loadDefaultPosts = () => {
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
  };

  // Optimized handlers to prevent unnecessary re-renders
  const handleTogglePrivacy = useCallback(async () => {
    const newIsPrivate = !profileState.isPrivate;
    setProfileState(prev => ({ ...prev, isPrivate: newIsPrivate }));
    
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            is_private: newIsPrivate,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error("Error updating privacy setting:", error);
          // Revert on error
          setProfileState(prev => ({ ...prev, isPrivate: !newIsPrivate }));
        }
      } catch (error) {
        console.error("Error updating privacy setting:", error);
        setProfileState(prev => ({ ...prev, isPrivate: !newIsPrivate }));
      }
    }
    
    // Update localStorage
    if (profileData) {
      const updatedProfile = { ...profileData, isPrivate: newIsPrivate };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData(updatedProfile);
    }
    
    toast({
      title: newIsPrivate ? "Profile is now private" : "Profile is now public",
      description: newIsPrivate 
        ? "Only approved followers can now see your posts and activity." 
        : "Everyone can now see your posts and activity."
    });
  }, [profileState.isPrivate, user, profileData, toast]);

  const handleFollow = useCallback(() => {
    const newIsFollowing = !profileState.isFollowing;
    setProfileState(prev => ({ ...prev, isFollowing: newIsFollowing }));
    
    toast({
      title: newIsFollowing ? "Following" : "Unfollowed",
      description: newIsFollowing 
        ? "You're now following this user. You'll see their updates in your feed." 
        : "You are no longer following this user."
    });
  }, [profileState.isFollowing, toast]);
  
  const handleOpenEditProfile = useCallback(() => {
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
    setProfileState(prev => ({ ...prev, editProfileOpen: true }));
  }, [profileData]);
  
  const handleCreatePostClick = useCallback(() => {
    setPostContent("");
    setPostImage(null);
    setPostImageUrl(null);
    setIsPostPublic(true);
    setProfileState(prev => ({ ...prev, createPostOpen: true }));
  }, []);
  
  const handleMessage = useCallback(() => {
    const currentUser = userData;
    if (currentUser) {
      navigate(`/chats/${currentUser.id || 'new'}`);
      toast({
        title: "Chat opened",
        description: "You can now message this user."
      });
    }
  }, [userData, navigate, toast]);
    
  // Optimized profile photo handling with proper error handling
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsLoading(true);
    
    try {
      if (user) {
        // Generate a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Create avatars bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(bucket => bucket.name === 'avatars')) {
          const { error: bucketError } = await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 5242880 // 5MB limit
          });
          
          if (bucketError) {
            throw new Error(`Failed to create avatars bucket: ${bucketError.message}`);
          }
        }
        
        // Upload the file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to get public URL');
        }
        
        const avatarUrl = publicUrlData.publicUrl;
        
        // Update profile in database
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            avatar: avatarUrl,
            updated_at: new Date().toISOString()
          });
          
        if (updateError) {
          console.error('Error updating profile in database:', updateError);
          // Continue anyway as the file was uploaded successfully
        }
        
        setAvatarUrl(avatarUrl);
        
        // Update local state and storage
        if (profileData) {
          const updatedProfile = { ...profileData, avatar: avatarUrl };
          localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
          setProfileData(updatedProfile);
        }
        
        if (userData) {
          const updatedUser = { ...userData, avatar: avatarUrl };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUserData(updatedUser);
        }
        
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been updated successfully."
        });
      } else {
        // Fallback to local storage if user is not authenticated
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
    } catch (error: any) {
      console.error("Error uploading profile photo:", error);
      toast({
        title: "Error updating photo",
        description: error.message || "Failed to update profile photo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Profile editing with better persistence
  const handleSaveProfile = async () => {
    if (!profileData) return;
    
    setIsLoading(true);
    
    try {
      const updatedProfile = { 
        ...profileData, 
        ...editProfileData,
        isPrivate: profileState.isPrivate,
        avatar: avatarUrl || profileData.avatar
      };

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: editProfileData.name,
            location: editProfileData.location,
            gender: editProfileData.gender,
            dob: editProfileData.dob,
            bio: editProfileData.bio,
            interests: editProfileData.interests,
            is_private: profileState.isPrivate,
            avatar: avatarUrl,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error("Error updating profile in Supabase:", error);
          // Continue with localStorage update
        }
      }
      
      // Always update localStorage
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
      
      // Update local state
      setProfileState(prev => ({
        ...prev,
        bio: editProfileData.bio || prev.bio,
        interests: editProfileData.interests || prev.interests,
        editProfileOpen: false
      }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create post with better media handling
  const handleCreatePost = async () => {
    if (postContent.trim() === '') {
      toast({
        title: "Cannot create post",
        description: "Please enter some content for your post.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const postId = `p-${uuidv4()}`;
      let imageUrl = postImageUrl;
      
      if (postImage && user) {
        try {
          // Create posts bucket if it doesn't exist
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.find(b => b.name === 'posts')) {
            await supabase.storage.createBucket('posts', { 
              public: true,
              fileSizeLimit: 10485760 // 10MB
            });
          }
          
          const filePath = `${user.id}/${postId}`;
          const { data, error } = await supabase.storage
            .from('posts')
            .upload(filePath, postImage);
            
          if (error) {
            console.error("Error uploading post image:", error);
          } else {
            const { data: publicUrl } = supabase.storage
              .from('posts')
              .getPublicUrl(filePath);
              
            if (publicUrl) {
              imageUrl = publicUrl.publicUrl;
            }
          }
        } catch (imageError) {
          console.error("Error uploading post image:", imageError);
        }
      }
      
      const newPost = {
        id: postId,
        content: postContent,
        image: imageUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isPublic: isPostPublic,
        type: "post"
      };
      
      if (user) {
        try {
          await supabase
            .from('posts')
            .insert({
              id: postId,
              user_id: user.id,
              content: postContent,
              image: imageUrl,
              is_public: isPostPublic,
              type: 'post',
              likes: 0,
              comments: 0,
              created_at: new Date().toISOString()
            });
        } catch (error) {
          console.error("Error saving post to Supabase:", error);
        }
      }
      
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem("userPosts", JSON.stringify(updatedPosts));
      
      setProfileState(prev => ({ ...prev, createPostOpen: false }));
      toast({
        title: "Post created",
        description: "Your post has been published successfully."
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error creating post",
        description: error.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
  
  const handleLoginPage = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // Show loading state to prevent shaking
  if (profileState.loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-300 h-24 w-24"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        <ProfileHeader
          avatarUrl={avatarUrl}
          userData={userData}
          profileData={profileData}
          user={user}
          handleProfilePhotoChange={handleProfilePhotoChange}
          handleLoginPage={handleLoginPage}
          isLoading={isLoading}
        />
        
        <ProfileInfo
          userData={userData}
          profileData={profileData}
          isPrivate={profileState.isPrivate}
          getAge={getAge}
        />
        
        <ProfileActions
          isFollowing={profileState.isFollowing}
          isPrivate={profileState.isPrivate}
          handleFollow={handleFollow}
          handleMessage={handleMessage}
          handleOpenEditProfile={handleOpenEditProfile}
          handleTogglePrivacy={handleTogglePrivacy}
          isLoading={isLoading}
        />
        
        <ProfileStats
          postsCount={posts.length}
          followers={profileData?.followers}
          following={profileData?.following}
        />
        
        <AboutSection
          bio={profileState.bio}
          setBio={(newBio) => setProfileState(prev => ({ ...prev, bio: newBio }))}
          profileData={profileData}
          setProfileData={setProfileData}
        />
        
        <InterestsSection interests={profileState.interests} />
        
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

      <EditProfileDialog
        open={profileState.editProfileOpen}
        onOpenChange={(open) => setProfileState(prev => ({ ...prev, editProfileOpen: open }))}
        editProfileData={editProfileData}
        setEditProfileData={setEditProfileData}
        handleSaveProfile={handleSaveProfile}
      />

      <CreatePostDialog
        open={profileState.createPostOpen}
        onOpenChange={(open) => setProfileState(prev => ({ ...prev, createPostOpen: open }))}
        postContent={postContent}
        setPostContent={setPostContent}
        isPostPublic={isPostPublic}
        setIsPostPublic={setIsPostPublic}
        postImageUrl={postImageUrl}
        setPostImageUrl={setPostImageUrl}
        setPostImage={setPostImage}
        handleCreatePost={handleCreatePost}
        isLoading={isLoading}
      />
    </MainLayout>
  );
}
