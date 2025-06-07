
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";

interface DiscoverHeroProps {
  timeOfDay: string;
  location: string;
  onLocationClick: () => void;
}

export function DiscoverHero({ timeOfDay, location, onLocationClick }: DiscoverHeroProps) {
  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good morning! Ready to discover new connections?';
      case 'afternoon':
        return 'Good afternoon! Who will you meet today?';
      case 'evening':
        return 'Good evening! Perfect time to connect with others!';
      default:
        return 'Ready to discover amazing people?';
    }
  };

  const isLocationError = location.includes('unavailable') || location.includes('Loading');

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{getGreeting()}</h1>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm opacity-90">{location}</span>
          {isLocationError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLocationClick}
              className="text-white hover:bg-white/20 ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
        <p className="text-sm opacity-80 mt-2">
          Discover people with shared interests and connect with your local community
        </p>
      </div>
    </div>
  );
}
