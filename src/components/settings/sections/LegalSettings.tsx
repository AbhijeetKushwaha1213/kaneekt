
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Shield, 
  Trash2, 
  LogOut, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export function LegalSettings() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    // In a real app, this would call an API to delete the user's account
    toast({
      title: "Account deletion",
      description: "This feature is coming soon."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Legal & Account</h2>
        <p className="text-muted-foreground">
          View legal documents and manage your account
        </p>
      </div>
      
      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Documents
          </CardTitle>
          <CardDescription>
            Review our terms and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Community Guidelines
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      {/* Account Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Account Controls
          </CardTitle>
          <CardDescription>
            Manage your account access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out of Account
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium mb-2">Danger Zone</p>
            <p className="text-sm text-muted-foreground mb-4">
              These actions cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. It will permanently delete your account
                    and remove all your data from our servers.
                    <br /><br />
                    Any content you've shared, including posts, messages, and profile information,
                    will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                  >
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
