
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCard } from '@/components/ui/user-card';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { USERS } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

interface InterestMatcherProps {
  userInterests: string[];
}

export function InterestMatcher({ userInterests = [] }: InterestMatcherProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userInterests.length > 0) {
      findMatches();
    }
  }, [userInterests]);

  const calculateMatchScore = (userInterests: string[], otherInterests: string[]) => {
    const commonInterests = userInterests.filter(interest => 
      otherInterests.includes(interest)
    );
    return commonInterests.length / Math.max(userInterests.length, otherInterests.length);
  };

  const findMatches = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const potentialMatches = USERS
        .filter(user => {
          const matchScore = calculateMatchScore(userInterests, user.interests);
          return matchScore > 0.2; // At least 20% compatibility
        })
        .map(user => ({
          ...user,
          matchScore: calculateMatchScore(userInterests, user.interests),
          commonInterests: userInterests.filter(interest => 
            user.interests.includes(interest)
          )
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6); // Top 6 matches

      setMatches(potentialMatches);
      setIsLoading(false);
    }, 1000);
  };

  const refreshMatches = () => {
    findMatches();
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
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Finding...' : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
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
          {matches.map(user => (
            <Card key={user.id} className="relative overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round(user.matchScore * 100)}% match
                </Badge>
              </div>
              
              <UserCard user={user} />
              
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    Common Interests
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.commonInterests.slice(0, 3).map((interest: string) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {user.commonInterests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.commonInterests.length - 3} more
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
