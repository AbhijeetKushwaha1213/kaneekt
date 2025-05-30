
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter, MapPin, Heart, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FilterOptions {
  ageRange: [number, number];
  distance: number;
  gender: string;
  interests: string[];
  occupation: string;
  education: string;
  relationshipStatus: string;
  premiumOnly: boolean;
  verifiedOnly: boolean;
}

const defaultFilters: FilterOptions = {
  ageRange: [18, 50],
  distance: 50,
  gender: 'all',
  interests: [],
  occupation: '',
  education: '',
  relationshipStatus: 'single',
  premiumOnly: false,
  verifiedOnly: false
};

export function SmartFilters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [availableInterests] = useState([
    'Technology', 'Music', 'Sports', 'Travel', 'Food', 'Art', 'Books', 
    'Movies', 'Fitness', 'Photography', 'Gaming', 'Dancing', 'Cooking'
  ]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedFilters();
  }, [user]);

  const loadSavedFilters = async () => {
    if (!user) return;
    
    // Load saved filters from localStorage for now
    const saved = localStorage.getItem(`filters_${user.id}`);
    if (saved) {
      setFilters(JSON.parse(saved));
    }
  };

  const saveFilters = async () => {
    if (!user) return;
    
    try {
      // Save filters to localStorage for now
      localStorage.setItem(`filters_${user.id}`, JSON.stringify(filters));
      
      toast({
        title: 'Filters saved',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving filters:', error);
      toast({
        title: 'Error',
        description: 'Failed to save filters.',
        variant: 'destructive'
      });
    }
  };

  const applyFilters = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Apply filters to find matches
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      // Age filter
      if (filters.ageRange[0] > 18 || filters.ageRange[1] < 50) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1]);
      }

      // Gender filter
      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      // Relationship status filter
      if (filters.relationshipStatus !== 'all') {
        query = query.eq('relationship_status', filters.relationshipStatus);
      }

      // Verified only
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      // Premium only
      if (filters.premiumOnly) {
        query = query.neq('premium_tier', 'free');
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      
      setMatches(data || []);
      await saveFilters();
      
      toast({
        title: 'Filters applied',
        description: `Found ${data?.length || 0} potential matches.`,
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply filters.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setMatches([]);
    toast({
      title: 'Filters reset',
      description: 'All filters have been reset to default values.',
    });
  };

  const toggleInterest = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Smart Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
            </label>
            <Slider
              value={filters.ageRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
              min={18}
              max={70}
              step={1}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distance: {filters.distance} km
            </label>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium mb-3 block">Gender</label>
            <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Interests ({filters.interests.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => (
                <Badge
                  key={interest}
                  variant={filters.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Occupation
            </label>
            <Select value={filters.occupation} onValueChange={(value) => setFilters(prev => ({ ...prev, occupation: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any occupation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any occupation</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Education */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </label>
            <Select value={filters.education} onValueChange={(value) => setFilters(prev => ({ ...prev, education: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any education level</SelectItem>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Status */}
          <div>
            <label className="text-sm font-medium mb-3 block">Relationship Status</label>
            <Select value={filters.relationshipStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, relationshipStatus: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Premium Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: !!checked }))}
              />
              <label htmlFor="verified" className="text-sm">Verified profiles only</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={filters.premiumOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, premiumOnly: !!checked }))}
              />
              <label htmlFor="premium" className="text-sm">Premium members only</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={applyFilters} disabled={loading} className="flex-1">
              {loading ? 'Applying...' : 'Apply Filters'}
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filtered Results ({matches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Found {matches.length} profiles matching your criteria. 
              Visit the Discover page to start browsing!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
