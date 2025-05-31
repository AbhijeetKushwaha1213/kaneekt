
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { StoriesCarousel } from "@/components/stories/StoriesCarousel";
import { NearbyPeople } from "@/components/discover/NearbyPeople";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { DiscoverTopics } from "@/components/discover/DiscoverTopics";
import { SortOptions } from "@/components/discover/SortOptions";
import { SearchFilters } from "@/components/ui/search-filters";
import { BackNavigation } from "@/components/ui/back-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MapPin, Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [sortBy, setSortBy] = useState("distance");
  const { user } = useAuth();

  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header with Navigation */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <BackNavigation />
            <h1 className="text-xl font-semibold">Discover</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Stories Section */}
        <div className="border-b bg-background">
          <StoriesCarousel currentUserId={user?.id} />
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Main Feed */}
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
                onLocationChange={() => {}}
              />
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="people" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">People</span>
                </TabsTrigger>
                <TabsTrigger value="nearby" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Nearby</span>
                </TabsTrigger>
                <TabsTrigger value="topics" className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span className="hidden sm:inline">Topics</span>
                </TabsTrigger>
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="people" className="mt-0">
                <div className="p-4">
                  <div className="mb-4">
                    <SortOptions value={sortBy} onChange={setSortBy} />
                  </div>
                  <DiscoverFeed 
                    searchQuery={searchQuery}
                    selectedInterests={selectedInterests}
                    ageRange={ageRange}
                    sortBy={sortBy}
                  />
                </div>
              </TabsContent>

              <TabsContent value="nearby" className="mt-0">
                <div className="p-4">
                  <NearbyPeople 
                    searchQuery={searchQuery}
                    selectedInterests={selectedInterests}
                  />
                </div>
              </TabsContent>

              <TabsContent value="topics" className="mt-0">
                <div className="p-4">
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
              </TabsContent>

              <TabsContent value="feed" className="mt-0">
                <div className="p-4">
                  <DiscoverHero 
                    timeOfDay={timeOfDay}
                    location="San Francisco, CA"
                    onLocationClick={() => {}}
                  />
                  <div className="mt-6">
                    <DiscoverFeed 
                      searchQuery={searchQuery}
                      selectedInterests={selectedInterests}
                      ageRange={ageRange}
                      sortBy={sortBy}
                      topics={selectedTopics}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom padding */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
