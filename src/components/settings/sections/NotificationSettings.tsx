
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  MessageSquare, 
  MessagesSquare, 
  Users, 
  Mail, 
  Volume2, 
  Smartphone
} from "lucide-react";

export function NotificationSettings() {
  const { toast } = useToast();
  const [pushNotifications, setPushNotifications] = useState({
    messages: true,
    comments: true,
    nearby: true,
    followers: true,
    all: true
  });
  
  const [emailNotifications, setEmailNotifications] = useState({
    messages: false,
    comments: false,
    digests: true,
    updates: true,
    all: false
  });
  
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    messageSound: true,
    notificationSound: true,
    vibration: true
  });
  
  const handleToggleAll = (type: 'push' | 'email', value: boolean) => {
    if (type === 'push') {
      setPushNotifications({
        messages: value,
        comments: value,
        nearby: value,
        followers: value,
        all: value
      });
      
      toast({
        title: "Push notifications updated",
        description: value ? "All push notifications enabled" : "All push notifications disabled"
      });
    } else {
      setEmailNotifications({
        messages: value,
        comments: value,
        digests: value,
        updates: value,
        all: value
      });
      
      toast({
        title: "Email notifications updated",
        description: value ? "All email notifications enabled" : "All email notifications disabled"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>
      
      <Tabs defaultValue="push">
        <TabsList className="mb-4">
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
          <TabsTrigger value="email">Email Notifications</TabsTrigger>
          <TabsTrigger value="sounds">Sound & Vibration</TabsTrigger>
        </TabsList>
        
        {/* Push Notifications */}
        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Control the notifications you receive on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="all-push">All Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all push notifications
                  </p>
                </div>
                <Switch
                  id="all-push"
                  checked={pushNotifications.all}
                  onCheckedChange={(checked) => handleToggleAll('push', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <Label htmlFor="message-push">New Messages</Label>
                </div>
                <Switch
                  id="message-push"
                  checked={pushNotifications.messages}
                  onCheckedChange={(checked) => {
                    setPushNotifications(prev => ({ ...prev, messages: checked }));
                  }}
                  disabled={!pushNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessagesSquare className="h-4 w-4 text-primary" />
                  <Label htmlFor="comment-push">Comments & Replies</Label>
                </div>
                <Switch
                  id="comment-push"
                  checked={pushNotifications.comments}
                  onCheckedChange={(checked) => {
                    setPushNotifications(prev => ({ ...prev, comments: checked }));
                  }}
                  disabled={!pushNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  <Label htmlFor="follower-push">Follower Requests</Label>
                </div>
                <Switch
                  id="follower-push"
                  checked={pushNotifications.followers}
                  onCheckedChange={(checked) => {
                    setPushNotifications(prev => ({ ...prev, followers: checked }));
                  }}
                  disabled={!pushNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-primary" />
                  <Label htmlFor="nearby-push">Nearby Activity</Label>
                </div>
                <Switch
                  id="nearby-push"
                  checked={pushNotifications.nearby}
                  onCheckedChange={(checked) => {
                    setPushNotifications(prev => ({ ...prev, nearby: checked }));
                  }}
                  disabled={!pushNotifications.all}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Email Notifications */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Control what emails you receive from us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="all-email">All Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all email notifications
                  </p>
                </div>
                <Switch
                  id="all-email"
                  checked={emailNotifications.all}
                  onCheckedChange={(checked) => handleToggleAll('email', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="digests-email">Weekly Digests</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of activity
                  </p>
                </div>
                <Switch
                  id="digests-email"
                  checked={emailNotifications.digests}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(prev => ({ ...prev, digests: checked }));
                  }}
                  disabled={!emailNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messages-email">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Email notifications for new direct messages
                  </p>
                </div>
                <Switch
                  id="messages-email"
                  checked={emailNotifications.messages}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(prev => ({ ...prev, messages: checked }));
                  }}
                  disabled={!emailNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comments-email">Comments & Mentions</Label>
                  <p className="text-sm text-muted-foreground">
                    Email when someone mentions or replies to you
                  </p>
                </div>
                <Switch
                  id="comments-email"
                  checked={emailNotifications.comments}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(prev => ({ ...prev, comments: checked }));
                  }}
                  disabled={!emailNotifications.all}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="updates-email">App Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new features and updates
                  </p>
                </div>
                <Switch
                  id="updates-email"
                  checked={emailNotifications.updates}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(prev => ({ ...prev, updates: checked }));
                  }}
                  disabled={!emailNotifications.all}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sound & Vibration */}
        <TabsContent value="sounds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Sound & Vibration
              </CardTitle>
              <CardDescription>
                Control notification sounds and vibration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sounds-enabled">Enable Sounds</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all notification sounds
                  </p>
                </div>
                <Switch
                  id="sounds-enabled"
                  checked={soundSettings.enabled}
                  onCheckedChange={(checked) => {
                    setSoundSettings(prev => ({ ...prev, enabled: checked }));
                    toast({
                      title: "Sound settings updated",
                      description: checked ? "Sounds enabled" : "Sounds disabled"
                    });
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <Label htmlFor="message-sound">Message Sounds</Label>
                </div>
                <Switch
                  id="message-sound"
                  checked={soundSettings.messageSound}
                  onCheckedChange={(checked) => {
                    setSoundSettings(prev => ({ ...prev, messageSound: checked }));
                  }}
                  disabled={!soundSettings.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-primary" />
                  <Label htmlFor="notification-sound">Notification Sounds</Label>
                </div>
                <Switch
                  id="notification-sound"
                  checked={soundSettings.notificationSound}
                  onCheckedChange={(checked) => {
                    setSoundSettings(prev => ({ ...prev, notificationSound: checked }));
                  }}
                  disabled={!soundSettings.enabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <Label htmlFor="vibration">Vibration</Label>
                </div>
                <Switch
                  id="vibration"
                  checked={soundSettings.vibration}
                  onCheckedChange={(checked) => {
                    setSoundSettings(prev => ({ ...prev, vibration: checked }));
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
