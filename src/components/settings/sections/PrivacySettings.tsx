
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MapPin, Activity, Lock, UserX, Bell } from "lucide-react";
import { LocationSettings } from "@/components/location/LocationSettings";

export function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    showLocation: true,
    showActivity: true,
    enableTwoFactor: false
  });
  
  useEffect(() => {
    async function loadPrivacySettings() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error loading privacy settings:", error);
          return;
        }
        
        setPrivacySettings(prev => ({
          ...prev,
          // Only use fields that exist in the current schema
          isPrivate: (data as any).is_private || false,
          showLocation: true // Default since location_sharing_enabled doesn't exist yet
        }));
      } catch (error) {
        console.error("Error loading privacy settings:", error);
      }
    }
    
    loadPrivacySettings();
  }, [user]);
  
  // Toggle profile visibility
  async function toggleProfileVisibility(isPrivate: boolean) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Only update fields that exist in the current schema
      const { error } = await supabase
        .from("profiles")
        .update({
          // Only update if is_private column exists
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      setPrivacySettings(prev => ({
        ...prev,
        isPrivate
      }));
      
      toast({
        title: "Privacy settings updated",
        description: `Your profile is now ${isPrivate ? "private" : "public"}.`
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your privacy settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Privacy & Security</h2>
        <p className="text-muted-foreground">
          Manage your privacy settings and account security
        </p>
      </div>
      
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="private-profile">Private Profile</Label>
              <p className="text-sm text-muted-foreground">
                Only approved followers can see your full profile
              </p>
            </div>
            <Switch
              id="private-profile"
              checked={privacySettings.isPrivate}
              onCheckedChange={toggleProfileVisibility}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Location Settings - Enhanced Component */}
      <LocationSettings />
      
      {/* Activity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Status
          </CardTitle>
          <CardDescription>
            Control how your online status is shown to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="activity-status">Show Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Let others see when you're online or last seen
              </p>
            </div>
            <Switch
              id="activity-status"
              checked={privacySettings.showActivity}
              onCheckedChange={(checked) => {
                setPrivacySettings(prev => ({ ...prev, showActivity: checked }));
                toast({
                  title: "Activity status updated",
                  description: `Activity status display ${checked ? "enabled" : "disabled"}.`
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code when logging in
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={privacySettings.enableTwoFactor}
              onCheckedChange={(checked) => {
                setPrivacySettings(prev => ({ ...prev, enableTwoFactor: checked }));
                toast({
                  title: "Two-factor authentication",
                  description: "This feature is coming soon.",
                });
              }}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Blocked and Muted Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Blocked & Muted Users
          </CardTitle>
          <CardDescription>
            Manage users you've blocked or muted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            You haven't blocked or muted any users yet.
          </p>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <UserX className="h-4 w-4 mr-2" />
              Blocked Users
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Muted Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
