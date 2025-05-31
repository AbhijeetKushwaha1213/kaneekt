
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, Heart, Users, Zap } from 'lucide-react';

interface SmartFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function SmartFilters({ onFiltersChange }: SmartFiltersProps) {
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [distance, setDistance] = useState([25]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const interests = [
    'Music', 'Travel', 'Photography', 'Sports', 'Art', 'Technology',
    'Food', 'Books', 'Movies', 'Gaming', 'Fitness', 'Nature'
  ];

  const handleInterestToggle = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    setSelectedInterests(updated);
    updateFilters({ interests: updated });
  };

  const updateFilters = (newFilters: any) => {
    onFiltersChange({
      ageRange,
      distance: distance[0],
      interests: selectedInterests,
      onlineOnly,
      verifiedOnly,
      ...newFilters
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Smart Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Range */}
        <div>
          <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
          <Slider
            value={ageRange}
            onValueChange={(value) => {
              setAgeRange(value);
              updateFilters({ ageRange: value });
            }}
            max={60}
            min={18}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Distance */}
        <div>
          <Label>Distance: {distance[0]}km</Label>
          <Slider
            value={distance}
            onValueChange={(value) => {
              setDistance(value);
              updateFilters({ distance: value[0] });
            }}
            max={100}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Interests */}
        <div>
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {interests.map(interest => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Online Now</Label>
            <Switch
              checked={onlineOnly}
              onCheckedChange={(checked) => {
                setOnlineOnly(checked);
                updateFilters({ onlineOnly: checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Verified Profiles Only</Label>
            <Switch
              checked={verifiedOnly}
              onCheckedChange={(checked) => {
                setVerifiedOnly(checked);
                updateFilters({ verifiedOnly: checked });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
