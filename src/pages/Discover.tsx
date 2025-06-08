
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Heart, MessageCircle, Camera } from 'lucide-react';
import { StoriesCarousel } from '@/components/stories/StoriesCarousel';
import { CreateStoryDialog } from '@/components/stories/CreateStoryDialog';
import { EventCreation } from '@/components/events/EventCreation';
import { EventDiscovery } from '@/components/events/EventDiscovery';
import { InterestMatcher } from '@/components/matching/InterestMatcher';
import { LiveLocationSharing } from '@/components/live/LiveLocationSharing';
import { useStories } from '@/hooks/useStories';
import { useEvents } from '@/hooks/useEvents';
import { useMatching } from '@/hooks/useMatching';
import { useLocationSharing } from '@/hooks/useLocationSharing';

const Discover = () => {
  const { stories, loading: storiesLoading } = useStories();
  const { events, loading: eventsLoading } = useEvents();
  const { matches, loading: matchesLoading } = useMatching();
  const { nearbyUsers, isSharing } = useLocationSharing();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
        <p className="text-gray-600">Connect with people and explore events around you</p>
      </div>

      {/* Stories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Stories
          </CardTitle>
          <CreateStoryDialog />
        </CardHeader>
        <CardContent>
          {storiesLoading ? (
            <div className="text-center py-8">Loading stories...</div>
          ) : (
            <StoriesCarousel stories={stories} />
          )}
        </CardContent>
      </Card>

      {/* Live Location Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveLocationSharing />
          {nearbyUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Nearby Users</h3>
              <div className="space-y-2">
                {nearbyUsers.map((userLocation) => (
                  <div key={userLocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {userLocation.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{userLocation.user?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">{userLocation.status}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{userLocation.location_name || 'Unknown location'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interest-Based Matching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Your Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InterestMatcher />
          {matchesLoading ? (
            <div className="text-center py-4">Loading matches...</div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {matches.map((match) => (
                <div key={match.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {match.matched_user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{match.matched_user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-green-600">{Math.round(match.match_score * 100)}% match</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{match.matched_user?.bio || 'No bio available'}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {match.common_interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No matches found yet. Complete your interests to find matches!</p>
          )}
        </CardContent>
      </Card>

      {/* Events Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Create Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventCreation />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : (
              <EventDiscovery />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Discover;
