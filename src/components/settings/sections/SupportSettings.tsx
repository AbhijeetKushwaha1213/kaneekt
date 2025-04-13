
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  ExternalLink,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SupportSettings() {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "feedback">("feedback");
  const [feedbackText, setFeedbackText] = useState("");
  
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedbackText.trim().length === 0) {
      toast({
        title: "Error",
        description: "Please enter your feedback before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Thank you!",
      description: "Your feedback has been submitted successfully."
    });
    
    setFeedbackText("");
  };
  
  // Placeholder app version info - replace with real data in production
  const appVersion = {
    version: "1.0.0",
    buildNumber: "123456",
    releaseDate: "2025-04-10"
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Support & Feedback</h2>
        <p className="text-muted-foreground">
          Get help, report issues, or share your ideas
        </p>
      </div>
      
      {/* Help Center Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Center
          </CardTitle>
          <CardDescription>
            Find answers to common questions and get support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-3 justify-start">
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Frequently Asked Questions</span>
                <span className="text-sm text-muted-foreground">
                  Browse our knowledge base
                </span>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="h-auto py-3 justify-start">
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Contact Support</span>
                <span className="text-sm text-muted-foreground">
                  Get help from our team
                </span>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="h-auto py-3 justify-start">
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Video Tutorials</span>
                <span className="text-sm text-muted-foreground">
                  Learn how to use the app
                </span>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="h-auto py-3 justify-start">
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Community Forums</span>
                <span className="text-sm text-muted-foreground">
                  Connect with other users
                </span>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            Report bugs, request features, or provide general feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <RadioGroup 
                value={feedbackType}
                onValueChange={(value) => setFeedbackType(value as "bug" | "feature" | "feedback")}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug" className="flex items-center gap-1">
                    <Bug className="h-4 w-4" />
                    Report a Bug
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature" className="flex items-center gap-1">
                    <Lightbulb className="h-4 w-4" />
                    Feature Request
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feedback" id="feedback" />
                  <Label htmlFor="feedback" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    General Feedback
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback-text">Your Feedback</Label>
              <Textarea
                id="feedback-text"
                placeholder={
                  feedbackType === "bug" 
                    ? "Please describe the issue you encountered..." 
                    : feedbackType === "feature" 
                    ? "Describe the feature you'd like to see..." 
                    : "Share your thoughts with us..."
                }
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback-email">Email (optional)</Label>
              <Input 
                id="feedback-email" 
                type="email" 
                placeholder="Your email for follow-up questions" 
              />
              <p className="text-xs text-muted-foreground">
                We'll only use your email to follow up on your feedback.
              </p>
            </div>
            
            <Button type="submit" className="w-full sm:w-auto">
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* App Version Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            App Information
          </CardTitle>
          <CardDescription>
            Details about your current app version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">{appVersion.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Build Number</p>
              <p className="font-medium">{appVersion.buildNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Released</p>
              <p className="font-medium">{appVersion.releaseDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1">Up to date</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
