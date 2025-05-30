
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Filter, Users, Map, Sparkles } from 'lucide-react';
import { NearbyPeople } from '@/components/discover/NearbyPeople';
import { NearbyUsersMap } from '@/components/discover/NearbyUsersMap';
import { SmartFilters } from '@/components/matching/SmartFilters';
import { StoriesCarousel } from '@/components/stories/StoriesCarousel';
import { MatchNotification } from '@/components/matches/MatchNotification';
import { CreateStoryDialog } from '@/components/stories/CreateStoryDialog';

export default function Discover() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Discover
            </h1>
            <p className="text-muted-foreground">Find your perfect match nearby</p>
          </div>
          
          <div className="flex gap-2">
            <CreateStoryDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <StoriesCarousel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <SmartFilters />
            </div>
          )}
          
          {/* Main Content */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="people" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Map View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="people" className="space-y-6">
                <NearbyPeople />
              </TabsContent>
              
              <TabsContent value="map">
                <NearbyUsersMap />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Match Notification Component */}
      <MatchNotification />
    </div>
  );
}
