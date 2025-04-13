
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Compass, Filter, Tag, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function DiscoverSettings() {
  const { toast } = useToast();
  const [radius, setRadius] = useState(50);
  const [feedPreference, setFeedPreference] = useState<"trending" | "recent">("trending");
  const [safeFilter, setSafeFilter] = useState(true);
  
  // Mock interests data - replace with real data from profile
  const [interests, setInterests] = useState([
    "Photography", "Travel", "Music", "Technology", "Sports"
  ]);
  
  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
    toast({
      title: "Discovery radius updated",
      description: `Your discovery radius is now ${value[0]} km.`
    });
  };
  
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
    toast({
      title: "Interest removed",
      description: `"${interest}" has been removed from your interests.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Discover Feed Preferences</h2>
        <p className="text-muted-foreground">
          Customize your discover feed to see content you're interested in
        </p>
      </div>
      
      {/* Discovery Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Discovery Radius
          </CardTitle>
          <CardDescription>
            Set how far to look for content and events near you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="radius-slider">Discovery Range</Label>
              <span className="font-medium">{radius} km</span>
            </div>
            <Slider 
              id="radius-slider"
              value={[radius]} 
              min={5} 
              max={100} 
              step={5}
              onValueChange={handleRadiusChange} 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Interest Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Interest Tags
          </CardTitle>
          <CardDescription>
            Manage interests to tailor your discover feed content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <Badge key={interest} variant="secondary" className="px-3 py-1">
                {interest}
                <button
                  className="ml-2 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  ×
                </button>
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="h-7">
              + Add Interest
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your feed will prioritize content matching your interests.
          </p>
        </CardContent>
      </Card>
      
      {/* Feed Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feed Preferences
          </CardTitle>
          <CardDescription>
            Choose how your discover feed is sorted and filtered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block">Sort Feed By</Label>
            <ToggleGroup type="single" value={feedPreference} onValueChange={(value) => {
              if (value) setFeedPreference(value as "trending" | "recent");
            }}>
              <ToggleGroupItem value="trending" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Trending
              </ToggleGroupItem>
              <ToggleGroupItem value="recent" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Recent
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="safe-filter">Safe Content Filter</Label>
              <p className="text-sm text-muted-foreground">
                Filter out potentially sensitive content
              </p>
            </div>
            <Switch
              id="safe-filter"
              checked={safeFilter}
              onCheckedChange={(checked) => {
                setSafeFilter(checked);
                toast({
                  title: "Content filter updated",
                  description: checked ? "Safe content filter enabled" : "Safe content filter disabled"
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
