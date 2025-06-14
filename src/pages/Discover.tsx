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
import { motion } from "framer-motion";
import { DiscoverGroupsTab } from "@/components/discover/tabs/DiscoverGroupsTab";

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
  }, [latitude, longitude, error, getCurrentPosition]);

  // Get user interests from profile
  const userInterests = profile?.interests || selectedInterests;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

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
                  <motion.div 
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <DiscoverFeed 
                      searchQuery={searchQuery}
                      selectedInterests={selectedInterests}
                      currentUserInterests={userInterests}
                      ageRange={ageRange}
                      sortBy={sortBy}
                      viewType="grid"
                    />
                  </motion.div>
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
                <DiscoverGroupsTab containerVariants={containerVariants} itemVariants={itemVariants} />
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
