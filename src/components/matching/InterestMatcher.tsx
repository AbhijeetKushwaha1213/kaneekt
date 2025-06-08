
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCard } from '@/components/ui/user-card';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { useMatching } from '@/hooks/useMatching';
import { useToast } from '@/hooks/use-toast';

interface InterestMatcherProps {
  userInterests: string[];
}

export function InterestMatcher({ userInterests = [] }: InterestMatcherProps) {
  const { matches, loading, generateMatches } = useMatching();
  const { toast } = useToast();

  useEffect(() => {
    if (userInterests.length > 0) {
      generateMatches();
    }
  }, [userInterests]);

  const refreshMatches = () => {
    generateMatches();
    toast({
      title: "Refreshing matches",
      description: "Finding new people who share your interests..."
    });
  };

  if (userInterests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Discover Compatible People</h3>
          <p className="text-sm text-muted-foreground">
            Add interests to your profile to get personalized match suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Smart Matches
          </h2>
          <p className="text-sm text-muted-foreground">
            People who share your interests and values
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshMatches}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Finding...' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(match => (
            <Card key={match.id} className="relative overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round(match.match_score * 100)}% match
                </Badge>
              </div>
              
              <UserCard user={{
                id: match.matched_user.id,
                name: match.matched_user.name,
                avatar: match.matched_user.avatar,
                bio: match.matched_user.bio || '',
                interests: match.matched_user.interests || [],
                location: '',
                age: 25,
                distance: match.distance_km || 0
              }} />
              
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    Common Interests
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.common_interests.slice(0, 3).map((interest: string) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {match.common_interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{match.common_interests.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adding more interests or check back later for new members
            </p>
            <Button onClick={refreshMatches}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
