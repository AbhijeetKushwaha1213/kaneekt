
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Image, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function StorageSettings() {
  const { toast } = useToast();
  
  // Mock storage data - replace with real data in production
  const storageData = {
    total: 1024, // MB
    used: 256, // MB
    media: 180, // MB
    messages: 40, // MB
    other: 36 // MB
  };
  
  const usedPercentage = (storageData.used / storageData.total) * 100;
  const mediaPercentage = (storageData.media / storageData.total) * 100;
  const messagesPercentage = (storageData.messages / storageData.total) * 100;
  const otherPercentage = (storageData.other / storageData.total) * 100;
  
  const handleClearCache = (type: 'media' | 'messages' | 'all') => {
    let description = '';
    
    switch (type) {
      case 'media':
        description = 'Media cache cleared.';
        break;
      case 'messages':
        description = 'Message cache cleared.';
        break;
      case 'all':
        description = 'All cache cleared successfully.';
        break;
    }
    
    toast({
      title: "Cache cleared",
      description
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Storage & Cache</h2>
        <p className="text-muted-foreground">
          Manage your storage usage and clear cached data
        </p>
      </div>
      
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Overview of your storage usage across the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {storageData.used} MB used of {storageData.total} MB
              </span>
              <span className="text-sm text-muted-foreground">
                {(storageData.total - storageData.used)} MB free
              </span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Media Files</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {storageData.media} MB
                </span>
              </div>
              <Progress value={mediaPercentage} className={cn("h-1", "bg-blue-100")} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Messages & Chats</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {storageData.messages} MB
                </span>
              </div>
              <Progress value={messagesPercentage} className={cn("h-1", "bg-green-100")} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Other Data</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {storageData.other} MB
                </span>
              </div>
              <Progress value={otherPercentage} className={cn("h-1", "bg-amber-100")} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Clear Cache
          </CardTitle>
          <CardDescription>
            Clear cached data to free up storage space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Media Cache</p>
              <p className="text-sm text-muted-foreground">
                Downloaded images, videos, and other media
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => handleClearCache('media')}
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Message Cache</p>
              <p className="text-sm text-muted-foreground">
                Cached messages and conversation history
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => handleClearCache('messages')}
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium">All Cached Data</p>
              <p className="text-sm text-muted-foreground">
                Clear all temporary data and cached content
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => handleClearCache('all')}
            >
              Clear All
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-2">
            Clearing cache may temporarily slow down the app as content is redownloaded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
