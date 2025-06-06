
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react';

const INTERESTS_OPTIONS = [
  'Technology', 'Sports', 'Music', 'Art', 'Travel', 'Food', 'Photography', 
  'Gaming', 'Books', 'Movies', 'Fitness', 'Fashion', 'Business', 'Science',
  'Nature', 'Cooking', 'Dancing', 'Writing', 'Design', 'Programming'
];

interface OnboardingData {
  name: string;
  bio: string;
  interests: string[];
  avatar?: string;
}

export function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: user?.user_metadata?.name || '',
    bio: '',
    interests: [],
    avatar: user?.user_metadata?.avatar_url || ''
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    
    if (!data.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: data.name.trim(),
          bio: data.bio.trim(),
          interests: data.interests,
          avatar: data.avatar,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome!",
        description: "Your profile has been set up successfully"
      });

      navigate('/chats');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length > 0;
      case 2:
        return true; // Bio is optional
      case 3:
        return true; // Interests are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to ChatApp</CardTitle>
          <CardDescription>
            Let's set up your profile (Step {currentStep} of 3)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={data.avatar} />
                  <AvatarFallback className="text-lg">
                    {data.name.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="mt-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  value={data.bio}
                  onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write a short bio about yourself..."
                  maxLength={160}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {data.bio.length}/160 characters
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>What are your interests?</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select topics that interest you (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_OPTIONS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={data.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                {data.interests.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.interests.length} selected
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading || !canProceed()}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
