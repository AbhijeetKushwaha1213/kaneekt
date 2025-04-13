
import { useState } from "react";
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface AboutSectionProps {
  bio: string;
  setBio: (bio: string) => void;
  profileData: User | null;
  setProfileData: (data: User | null) => void;
}

export function AboutSection({ 
  bio, 
  setBio, 
  profileData, 
  setProfileData 
}: AboutSectionProps) {
  const [editingBio, setEditingBio] = useState(false);
  const { toast } = useToast();

  const handleSaveBio = () => {
    setEditingBio(false);
    if (profileData) {
      const updatedProfile = { ...profileData, bio };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfileData(updatedProfile);
    }
    toast({
      title: "Profile updated",
      description: "Your bio has been updated successfully."
    });
  };

  return (
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
  );
}
