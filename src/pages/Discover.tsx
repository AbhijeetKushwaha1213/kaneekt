
import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { UserCard } from "@/components/ui/user-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { USERS } from "@/data/mock-data";
import { User } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";
import { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
import { MapPin, Sliders, Users, Compass, TrendingUp, Clock } from "lucide-react";
import { LocationSelector } from "@/components/discover/LocationSelector";
import { Button } from "@/components/ui/button";
import { SortOptions } from "@/components/discover/SortOptions";
import { PostCreationButton } from "@/components/discover/PostCreationButton";

export default function Discover() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(USERS);
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [currentLocation, setCurrentLocation] = useState<string>("Your Location (10km radius)");
  const [sortBy, setSortBy] = useState<string>("trending");
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  
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
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Discover</h1>
            <p className="text-muted-foreground">
              Find interesting content and people nearby
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsLocationSelectorOpen(true)}
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLocation}</span>
            </Button>
            
            <PostCreationButton />
          </div>
        </div>
        
        <div>
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
            
            <TabsContent value="feed" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SearchFilters onSearch={handleSearch} className="mb-6" />
                  <DiscoverFeed sortBy={sortBy} />
                </div>
                
                <DiscoverSidebar />
              </div>
            </TabsContent>
            
            <TabsContent value="people" className="mt-0">
              <SearchFilters onSearch={handleSearch} className="mb-6" />
              
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-lg font-medium mb-2">No matches found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Try adjusting your search filters to find more people
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map((user, index) => (
                    <UserCard 
                      key={user.id} 
                      user={user}
                      className={`animate-in fade-in-up stagger-${(index % 5) + 1}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
