
import { useState } from "react";
import { Search, Sliders } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InterestBadge } from "@/components/ui/interest-badge";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  ageRange: [number, number];
  onAgeRangeChange: (range: [number, number]) => void;
  onLocationChange: () => void;
  className?: string;
}

export function SearchFilters({ 
  searchQuery,
  onSearchChange,
  selectedInterests,
  onInterestsChange,
  ageRange,
  onAgeRangeChange,
  onLocationChange,
  className 
}: SearchFiltersProps) {
  const [distance, setDistance] = useState([25]);

  const interests = [
    "Sports", "Philosophy", "Politics", "Climate", 
    "Technology", "Science", "Arts", "Music", 
    "Literature", "Travel", "Food", "Gaming", 
    "Photography", "Fitness", "Meditation"
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter((i) => i !== interest));
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const handleSearch = () => {
    // Implementation for search functionality
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or interest..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Sliders className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="pb-4">
              <SheetTitle>Filter options</SheetTitle>
              <SheetDescription>
                Find people based on specific criteria
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              {/* Distance slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <span className="text-sm text-muted-foreground">{distance[0]} km</span>
                </div>
                <Slider
                  id="distance"
                  max={100}
                  step={5}
                  value={distance}
                  onValueChange={setDistance}
                />
              </div>

              {/* Age range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="age-range">Age range</Label>
                  <span className="text-sm text-muted-foreground">
                    {ageRange[0]} - {ageRange[1]}
                  </span>
                </div>
                <Slider
                  id="age-range"
                  max={80}
                  min={18}
                  step={1}
                  value={ageRange}
                  onValueChange={onAgeRangeChange}
                />
              </div>

              {/* Looking for */}
              <div className="space-y-2">
                <Label>Looking for</Label>
                <RadioGroup defaultValue="all">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All connections</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discussions" id="discussions" />
                    <Label htmlFor="discussions">Discussions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sports" id="sports" />
                    <Label htmlFor="sports">Sports activities</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="projects" id="projects" />
                    <Label htmlFor="projects">Project collaborations</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interests.map((interest) => (
                    <InterestBadge
                      key={interest}
                      label={interest}
                      selected={selectedInterests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Selected filters display */}
      {selectedInterests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedInterests.map((interest) => (
            <InterestBadge
              key={interest}
              label={interest}
              selected
              onClick={() => toggleInterest(interest)}
              className="pr-2"
            />
          ))}
          {selectedInterests.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onInterestsChange([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
