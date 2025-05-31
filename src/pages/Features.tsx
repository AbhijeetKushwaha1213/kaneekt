
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeStatus } from '@/components/realtime/RealTimeStatus';
import { PushNotifications } from '@/components/notifications/PushNotifications';
import { PremiumFeatures } from '@/components/premium/PremiumFeatures';
import { MediaSharing } from '@/components/media/MediaSharing';
import { SafetyCenter } from '@/components/safety/SafetyCenter';
import { UserAnalytics } from '@/components/analytics/UserAnalytics';
import { Achievements } from '@/components/gamification/Achievements';
import { ProfessionalNetworking } from '@/components/professional/ProfessionalNetworking';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Zap, Crown, Camera, Shield, BarChart, Trophy, 
  Briefcase, Bot, Bell, Users 
} from 'lucide-react';

export default function Features() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('realtime');

  const featureTabs = [
    { id: 'realtime', label: 'Real-time', icon: <Zap className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'premium', label: 'Premium', icon: <Crown className="h-4 w-4" /> },
    { id: 'media', label: 'Media', icon: <Camera className="h-4 w-4" /> },
    { id: 'safety', label: 'Safety', icon: <Shield className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart className="h-4 w-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-4 w-4" /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'ai', label: 'AI Assistant', icon: <Bot className="h-4 w-4" /> }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Features" 
          subtitle="Explore all the advanced features available to enhance your experience"
        />
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-6">
              {featureTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-1 text-xs"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="realtime" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Real-time Features</h2>
                  <p className="text-muted-foreground mb-6">
                    See who's online, get instant notifications, and connect in real-time
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Online Status</h3>
                      <div className="flex items-center gap-4">
                        <RealTimeStatus userId={user?.id || 'demo'} showLabel />
                        <span className="text-sm text-muted-foreground">
                          Your current status
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Coming Soon</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Live video chat</li>
                      <li>• Real-time location sharing</li>
                      <li>• Instant match notifications</li>
                      <li>• Live activity feed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <PushNotifications />
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Notification Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your notification preferences in Settings to control when and how you receive alerts.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="premium">
              <PremiumFeatures />
            </TabsContent>

            <TabsContent value="media">
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Media Sharing</h2>
                <p className="text-muted-foreground mb-6">
                  Share photos, videos, and other media content with your connections
                </p>
                <MediaSharing onMediaUpload={(media) => console.log('Media uploaded:', media)} />
              </div>
            </TabsContent>

            <TabsContent value="safety">
              <SafetyCenter />
            </TabsContent>

            <TabsContent value="analytics">
              <UserAnalytics userId={user?.id || 'demo'} />
            </TabsContent>

            <TabsContent value="achievements">
              <Achievements />
            </TabsContent>

            <TabsContent value="professional">
              <ProfessionalNetworking />
            </TabsContent>

            <TabsContent value="ai">
              <AIAssistant />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add padding at the bottom to account for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
