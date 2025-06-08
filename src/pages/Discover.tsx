
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { PostCreationButton } from "@/components/discover/PostCreationButton";
import { StoriesCarousel } from "@/components/stories/StoriesCarousel";
import { CreateStoryDialog } from "@/components/stories/CreateStoryDialog";
import { EventDiscovery } from "@/components/events/EventDiscovery";
import { InterestMatcher } from "@/components/matching/InterestMatcher";
import { LiveLocationSharing } from "@/components/live/LiveLocationSharing";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useStories } from "@/hooks/useStories";
import { useEvents } from "@/hooks/useEvents";
import { useMatching } from "@/hooks/useMatching";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { MapPin, Users, Calendar, Heart, Plus } from "lucide-react";

function DiscoverContent() {
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const { 
    latitude, 
    longitude, 
    error: locationError, 
    loading: locationLoading,
    getCurrentPosition 
  } = useGeolocation();
  
  const { stories, createStory } = useStories();
  const { events } = useEvents();
  const { matches } = useMatching();
  const { nearbyUsers, isSharing } = useLocationSharing();

  // Get time-based greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  // Format location display
  const getLocationDisplay = () => {
    if (locationLoading) return "Loading location...";
    if (locationError) return "Location unavailable";
    if (latitude && longitude) {
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    }
    return "Enable location for better discovery";
  };

  const handleLocationClick = () => {
    getCurrentPosition();
  };

  const handleCreateStory = async (storyData: any) => {
    const result = await createStory(storyData);
    if (result.data) {
      setStoryDialogOpen(false);
    }
  };

  const stats = [
    { icon: Users, label: "Nearby Users", value: nearbyUsers.length },
    { icon: Calendar, label: "Local Events", value: events.filter(e => e.is_public).length },
    { icon: Heart, label: "New Matches", value: matches.length },
    { icon: MapPin, label: "Sharing", value: isSharing ? "Active" : "Inactive" }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <DiscoverHero 
          timeOfDay={getTimeOfDay()}
          location={getLocationDisplay()}
          onLocationClick={handleLocationClick}
        />

        {/* Quick Stats */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stories Section */}
        <div className="px-4 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Stories</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStoryDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Story
              </Button>
            </div>
            <StoriesCarousel stories={stories} />
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="nearby">Nearby</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
              </TabsList>
              
              <TabsContent value="events" className="mt-6">
                <EventDiscovery />
              </TabsContent>
              
              <TabsContent value="matches" className="mt-6">
                <InterestMatcher />
              </TabsContent>
              
              <TabsContent value="nearby" className="mt-6">
                <LiveLocationSharing />
              </TabsContent>
              
              <TabsContent value="create" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Content</h3>
                  <div className="grid gap-4">
                    <PostCreationButton />
                    <Button
                      variant="outline"
                      onClick={() => setStoryDialogOpen(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Story
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Story Dialog */}
        <CreateStoryDialog
          open={storyDialogOpen}
          onOpenChange={setStoryDialogOpen}
          onCreateStory={handleCreateStory}
        />
        
        {/* Mobile bottom padding */}
        <div className="md:hidden h-16"></div>
      </div>
    </MainLayout>
  );
}

export default function Discover() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  );
}
