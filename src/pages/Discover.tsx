
import React, { useState, useEffect } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { UserCard } from "@/components/ui/user-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { USERS } from "@/data/mock-data";
import { User } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
import { MapPin, Sliders, Users, Compass, TrendingUp, Clock, PlusCircle } from "lucide-react";
import { LocationSelector } from "@/components/discover/LocationSelector";
import { Button } from "@/components/ui/button";
import { SortOptions } from "@/components/discover/SortOptions";
import { PostCreationButton } from "@/components/discover/PostCreationButton";
import { DiscoverHero } from "@/components/discover/DiscoverHero";
import { DiscoverTopics } from "@/components/discover/DiscoverTopics";
import { NearbyPeople } from "@/components/discover/NearbyPeople";
import { useToast } from "@/hooks/use-toast";

export default function Discover() {
  const { toast } = useToast();
  const [filteredUsers, setFilteredUsers] = useState<User[]>(USERS);
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [currentLocation, setCurrentLocation] = useState<string>("Your Location (10km radius)");
  const [sortBy, setSortBy] = useState<string>("trending");
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const handleSearch = (filters: any) => {
    // Apply filters to the users data
    let results = [...USERS];
    
    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        user => 
          user.name.toLowerCase().includes(query) ||
          user.interests.some(interest => 
            interest.toLowerCase().includes(query)
          )
      );
    }
    
    // Filter by distance
    if (filters.distance) {
      results = results.filter(
        user => !user.distance || user.distance <= filters.distance
      );
    }
    
    // Filter by age range
    if (filters.ageRange) {
      results = results.filter(
        user => user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1]
      );
    }
    
    // Filter by interests
    if (filters.interests && filters.interests.length > 0) {
      results = results.filter(
        user => filters.interests.some((interest: string) => 
          user.interests.includes(interest)
        )
      );
    }
    
    setFilteredUsers(results);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });

    toast({
      title: `Topic ${selectedTopics.includes(topic) ? "removed" : "added"}`,
      description: `Your feed will ${selectedTopics.includes(topic) ? "no longer" : "now"} show content related to ${topic}`,
    });
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <DiscoverHero 
          timeOfDay={getTimeOfDay()} 
          location={currentLocation}
          onLocationClick={() => setIsLocationSelectorOpen(true)}
        />
        
        {/* Stories Section */}
        <div className="px-4 sm:px-6">
          <StoriesCarousel />
        </div>
        
        {/* Main Content */}
        <div className="px-4 sm:px-6">
          <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center border-b mb-4">
              <TabsList>
                <TabsTrigger value="feed" className="flex items-center gap-1">
                  <Compass className="h-4 w-4" />
                  <span>Feed</span>
                </TabsTrigger>
                <TabsTrigger value="people" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>People</span>
                </TabsTrigger>
              </TabsList>
              
              <SortOptions value={sortBy} onChange={setSortBy} />
            </div>

            {/* Topic filters */}
            <DiscoverTopics 
              selectedTopics={selectedTopics} 
              onTopicSelect={handleTopicSelect}
            />
            
            <TabsContent value="feed" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SearchFilters onSearch={handleSearch} className="mb-6" />
                  
                  {/* Nearby People Section (Mobile Only) */}
                  <div className="block lg:hidden mb-6">
                    <NearbyPeople />
                  </div>
                  
                  <DiscoverFeed 
                    sortBy={sortBy}
                    topics={selectedTopics}
                  />
                </div>
                
                <div className="hidden lg:block">
                  <DiscoverSidebar />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="people" className="mt-4">
              <SearchFilters onSearch={handleSearch} className="mb-6" />
              
              {/* Nearby People Section */}
              <div className="mb-6">
                <NearbyPeople />
              </div>
              
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-2">No matches found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Try adjusting your search filters to find more people
                  </p>
                  <Button variant="outline">Reset Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map((user, index) => (
                    <UserCard 
                      key={user.id} 
                      user={user}
                      className="animate-in fade-in-up hover:shadow-md transition-all duration-300"
                      style={{
                        animationDelay: `${(index % 5) * 100}ms`
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Post Creation Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <PostCreationButton />
      </div>
      
      <LocationSelector 
        isOpen={isLocationSelectorOpen} 
        onClose={() => setIsLocationSelectorOpen(false)}
        onSelectLocation={(location) => {
          setCurrentLocation(location);
          setIsLocationSelectorOpen(false);
        }}
      />
    </MainLayout>
  );
}
