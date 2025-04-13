import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Camera } from "lucide-react";
import { Profile } from "@/types/supabase";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-google"
  >
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    <path d="M17.5 12h-11" />
    <path d="M12 6.5v11" />
  </svg>
);

interface ProfileFormValues {
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  avatar: string;
  phone: string;
}

export function AccountSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      location: "",
      avatar: "",
      phone: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error loading profile:", error);
          return;
        }
        
        setProfile(data);
        setAvatarUrl(data?.avatar || null);
        
        form.reset({
          name: data?.name || "",
          username: data?.username || "",
          email: user?.email || "",
          bio: data?.bio || "",
          location: data?.location || "",
          avatar: data?.avatar || "",
          phone: user?.phone || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
    
    loadProfile();
  }, [user, form]);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(bucket => bucket.name === "avatars");
      
      if (!avatarBucket) {
        const { error } = await supabase.storage
          .createBucket('avatars', { public: true });
        
        if (error) {
          toast({
            title: "Error creating storage bucket",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      
      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      if (data) {
        setAvatarUrl(data.publicUrl);
        form.setValue("avatar", data.publicUrl);
        
        await supabase
          .from("profiles")
          .update({ avatar: data.publicUrl })
          .eq("id", user?.id);
        
        toast({
          title: "Success",
          description: "Avatar updated successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          username: data.username,
          bio: data.bio,
          location: data.location,
          avatar: data.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback>
                    {form.watch("name")?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Upload Image</span>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Your location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Manage your contact information and account recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled placeholder="Your email" {...field} />
                    </FormControl>
                    <FormDescription>
                      To change your email, please contact support.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for account recovery and optional notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Link your social accounts for easier login and extended features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GoogleIcon />
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.app_metadata?.provider === "google" ? 
                        "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={user?.app_metadata?.provider === "google" ? "outline" : "default"}
                  size="sm"
                >
                  {user?.app_metadata?.provider === "google" ? "Disconnect" : "Connect"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium">Email/Password</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.app_metadata?.provider === "email" ? 
                        "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Change password",
                      description: "Password reset feature coming soon.",
                    });
                  }}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
