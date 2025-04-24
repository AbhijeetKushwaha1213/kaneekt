
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (user) {
        // Check if user already has a profile
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        // Calculate date of birth from age
        const birthYear = age ? new Date().getFullYear() - parseInt(age) : null;
        const dob = birthYear ? `${birthYear}-01-01` : null; // Approximate DoB
        
        if (!data) {
          // Create new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name,
              location,
              gender,
              dob,
              bio: "",
              interests: [],
              is_private: false,
              followers: 0,
              following: 0
            });
            
          if (insertError) {
            throw insertError;
          }
        } else {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              name,
              location,
              gender,
              dob
            })
            .eq('id', user.id);
            
          if (updateError) {
            throw updateError;
          }
        }
      }
      
      // Update local storage as well
      const storedUserData = localStorage.getItem("userProfile");
      let userData = {};
      
      if (storedUserData) {
        userData = JSON.parse(storedUserData);
      }
      
      const birthYear = age ? new Date().getFullYear() - parseInt(age) : null;
      const dob = birthYear ? `${birthYear}-01-01` : null;
      
      const updatedUserData = {
        ...userData,
        name,
        location,
        gender,
        dob,
        age: age ? parseInt(age) : null
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedUserData));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved",
      });
      
      // Redirect to profile page
      navigate("/profile");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message || "Failed to save your profile information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Syncterest</CardTitle>
          <CardDescription>Please complete your profile to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Profile & Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
