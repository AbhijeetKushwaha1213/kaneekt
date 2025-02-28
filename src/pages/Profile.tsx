
import { useState } from "react";
import { Camera, Edit, MapPin, Calendar, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { InterestBadge } from "@/components/ui/interest-badge";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [bio, setBio] = useState("Philosophy enthusiast and tech professional. I enjoy deep conversations about consciousness, ethics, and the future of AI. Always up for a good debate or collaborative projects.");
  const [editingBio, setEditingBio] = useState(false);
  const [interests, setInterests] = useState([
    "Philosophy", "Technology", "Ethics", "Artificial Intelligence", 
    "Psychology", "Climate Change", "Literature"
  ]);
  
  const handleSaveBio = () => {
    setEditingBio(false);
    // Here you would typically save the updated bio to your backend
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        {/* Profile header */}
        <div className="relative rounded-xl overflow-hidden">
          {/* Cover photo */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 to-accent/30"></div>
          
          {/* Profile photo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 md:-bottom-20">
            <div className="relative">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback className="text-4xl">JD</AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-2 right-2 rounded-full shadow-md"
                aria-label="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="mt-20 text-center">
          <h1 className="text-2xl font-bold">John Doe</h1>
          <div className="flex items-center justify-center gap-3 text-muted-foreground mt-1">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              San Francisco, CA
            </div>
            <span>•</span>
            <div>28 years old</div>
          </div>
        </div>
        
        {/* Bio */}
        <Card className="relative">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-medium">About Me</h2>
              {!editingBio && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingBio(true)}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border rounded-md h-32 resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingBio(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveBio}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{bio}</p>
            )}
          </CardContent>
        </Card>
        
        {/* Interests */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Interests</h2>
              <Button variant="ghost" size="sm" className="h-8">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <InterestBadge key={interest} label={interest} />
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-7 px-3"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity tabs */}
        <Tabs defaultValue="activities">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="mt-4">
            <Card>
              <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No activities yet</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  You haven't planned any activities or meetups yet
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="channels" className="mt-4">
            <Card>
              <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No channels joined</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Join channels to connect with people who share your interests
                </p>
                <Button asChild>
                  <Link to="/channels">
                    Explore Channels
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

// Missing import
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
