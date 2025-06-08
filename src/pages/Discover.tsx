
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { StoriesCarousel } from "@/components/stories/StoriesCarousel";
import { NearbyPeople } from "@/components/discover/NearbyPeople";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { DiscoverTopics } from "@/components/discover/DiscoverTopics";
import { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
import { SortOptions } from "@/components/discover/SortOptions";
import { SearchFilters } from "@/components/ui/search-filters";
import { EventDiscovery } from "@/components/events/EventDiscovery";
import { InterestMatcher } from "@/components/matching/InterestMatcher";
import { LiveLocationSharing } from "@/components/live/LiveLocationSharing";
import { GroupCreation } from "@/components/groups/GroupCreation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MapPin, Compass, CalendarIcon, Sparkles, Wifi, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [sortBy, setSortBy] = useState("distance");
  const [activeTab, setActiveTab] = useState("people");
  const { user } = useAuth();
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const { latitude, longitude, error, getCurrentPosition } = useGeolocation();

  // Get the time of day for personalized greeting
  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";
  
  // Get location on component mount
  useEffect(() => {
    if (!latitude && !longitude && !error) {
      getCurrentPosition();
    }
  }, []);

  // Get user interests from profile
  const userInterests = profile?.interests || selectedInterests;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Stories Section */}
        <div className="border-b bg-background">
          <StoriesCarousel currentUserId={user?.id} />
        </div>

        {/* Main Content */}
        <div className={cn("flex", isMobile ? "flex-col" : "")}>
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="lg:hidden border-b">
              <SearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedInterests={selectedInterests}
                onInterestsChange={setSelectedInterests}
                ageRange={ageRange}
                onAgeRangeChange={setAgeRange}
                onLocationChange={() => getCurrentPosition()}
              />
            </div>

            {/* Discovery Hero Section */}
            <div className="border-b">
              <DiscoverHero 
                timeOfDay={timeOfDay}
                location={error ? "Location unavailable" : latitude && longitude ? "Near you" : "Loading location..."}
                onLocationClick={getCurrentPosition}
              />
            </div>
            
            {/* Topic Pills for quick filtering */}
            <div className="px-4 py-3 border-b overflow-x-auto">
              <DiscoverTopics 
                selectedTopics={selectedTopics}
                onTopicSelect={(topic) => {
                  setSelectedTopics(prev => 
                    prev.includes(topic) 
                      ? prev.filter(t => t !== topic)
                      : [...prev, topic]
                  );
                }}
              />
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={cn(
                "grid w-full grid-cols-6 sticky top-0 z-10 bg-background/95 backdrop-blur",
                isMobile ? "h-14" : ""
              )}>
                <TabsTrigger 
                  value="people" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("people")}
                >
                  <Users className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>People</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="nearby" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("nearby")}
                >
                  <MapPin className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>Nearby</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="live" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("live")}
                >
                  <Wifi className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>Live</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("events")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>Events</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="matches" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("matches")}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>Matches</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="groups" 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab("groups")}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className={cn(isMobile ? "text-xs" : "")}>Groups</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="people" className="mt-0 animate-in fade-in-50">
                <div className="p-4">
                  <div className="mb-4">
                    <SortOptions value={sortBy} onChange={setSortBy} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DiscoverFeed 
                      searchQuery={searchQuery}
                      selectedInterests={selectedInterests}
                      ageRange={ageRange}
                      sortBy={sortBy}
                      viewType="grid"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nearby" className="mt-0 animate-in fade-in-50">
                <div className="p-4">
                  <NearbyPeople 
                    searchQuery={searchQuery}
                    selectedInterests={selectedInterests}
                    latitude={latitude}
                    longitude={longitude}
                    onRequestLocation={getCurrentPosition}
                  />
                </div>
              </TabsContent>

              <TabsContent value="live" className="mt-0 animate-in fade-in-50">
                <div className="p-4">
                  <LiveLocationSharing />
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-0 animate-in fade-in-50">
                <div className="p-4">
                  <EventDiscovery 
                    userLocation={latitude && longitude ? { latitude, longitude } : undefined}
                    selectedInterests={userInterests}
                  />
                </div>
              </TabsContent>

              <TabsContent value="matches" className="mt-0 animate-in fade-in-50">
                <div className="p-4">
                  <InterestMatcher userInterests={userInterests} />
                </div>
              </TabsContent>

              <TabsContent value="groups" className="mt-0 animate-in fade-in-50">
                <div className="p-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Interest Groups</h2>
                      <p className="text-muted-foreground">Join group chats with people who share your interests</p>
                    </div>
                    <GroupCreation />
                  </div>
                  
                  {/* Mock Group Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { name: "Philosophy Discussions", members: 45, topic: "Philosophy", description: "Deep conversations about consciousness, ethics, and reality" },
                      { name: "Photography Club", members: 128, topic: "Photography", description: "Share photos, tips, and organize photo walks" },
                      { name: "Book Lovers", members: 89, topic: "Reading", description: "Monthly book discussions and recommendations" },
                      { name: "Fitness Buddies", members: 156, topic: "Fitness", description: "Workout tips, motivation, and group challenges" },
                      { name: "Tech Talk", members: 203, topic: "Technology", description: "Latest tech trends, coding tips, and project collaboration" },
                      { name: "Cooking Together", members: 67, topic: "Cooking", description: "Recipe sharing and virtual cooking sessions" }
                    ].map((group) => (
                      <div key={group.name} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {group.members} members
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{group.topic}</Badge>
                              <Button size="sm">Join</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Only visible on desktop */}
          {!isMobile && (
            <div className="w-80 border-l p-4 hidden lg:block">
              <DiscoverSidebar />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
