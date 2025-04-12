
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Image, MapPin, Globe, Users, Lock } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InterestBadge } from "@/components/ui/interest-badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function PostCreationButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();
  
  const interests = [
    "Sports", "Technology", "Food", "Travel", "Music", 
    "Art", "Politics", "Science", "Fashion", "Gaming"
  ];
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something to post",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally submit the post to your backend
    toast({
      title: "Post created!",
      description: "Your post has been shared with the community",
    });
    
    // Reset form and close dialog
    setContent("");
    setLocation("");
    setVisibility("public");
    setSelectedInterests([]);
    setIsDialogOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        <span>Post</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="flex gap-2">
              <Button variant="outline" type="button" className="flex gap-1 flex-1">
                <Image className="h-4 w-4" />
                <span>Add Media</span>
              </Button>
              
              <Button 
                variant="outline" 
                type="button" 
                className={cn(
                  "flex gap-1 flex-1",
                  location && "bg-secondary"
                )}
              >
                <MapPin className="h-4 w-4" />
                <Input 
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-none bg-transparent p-0 focus-visible:ring-0 h-auto"
                />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Add topics</Label>
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <InterestBadge
                    key={interest}
                    label={interest}
                    selected={selectedInterests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup 
                value={visibility} 
                onValueChange={setVisibility}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-2" />
                    Public - Visible to everyone
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nearby" id="nearby" />
                  <Label htmlFor="nearby" className="flex items-center cursor-pointer">
                    <MapPin className="h-4 w-4 mr-2" />
                    Nearby - Prioritized for people nearby
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="connections" id="connections" />
                  <Label htmlFor="connections" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    Connections only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-2" />
                    Private - Only visible to me
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
