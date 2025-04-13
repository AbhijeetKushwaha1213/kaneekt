
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Video, Headphones, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function VoiceSettings() {
  const { toast } = useToast();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [inputDevice, setInputDevice] = useState("default");
  const [outputDevice, setOutputDevice] = useState("default");
  const [screenShare, setScreenShare] = useState("ask");
  
  // Mock devices - in a real application, these would be fetched using browser APIs
  const inputDevices = [
    { id: "default", label: "Default Microphone" },
    { id: "mic-1", label: "Built-in Microphone" },
    { id: "mic-2", label: "Headset Microphone" }
  ];
  
  const outputDevices = [
    { id: "default", label: "Default Speakers" },
    { id: "output-1", label: "Built-in Speakers" },
    { id: "output-2", label: "Headphones" }
  ];
  
  const handleTestMicrophone = () => {
    toast({
      title: "Testing microphone",
      description: "This feature is coming soon."
    });
  };
  
  const handleTestSpeakers = () => {
    toast({
      title: "Testing speakers",
      description: "This feature is coming soon."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Voice & Video Settings</h2>
        <p className="text-muted-foreground">
          Configure your voice and video settings for calls and channels
        </p>
      </div>
      
      {/* Default Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Default Settings
          </CardTitle>
          <CardDescription>
            Set your default microphone and camera settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-primary" />
              <div>
                <Label>Enable Microphone by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically turn on mic when joining voice chats
                </p>
              </div>
            </div>
            <Switch
              checked={micEnabled}
              onCheckedChange={setMicEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <Label>Enable Camera by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically turn on camera when joining video chats
                </p>
              </div>
            </div>
            <Switch
              checked={cameraEnabled}
              onCheckedChange={setCameraEnabled}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Input & Output Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Audio Devices
          </CardTitle>
          <CardDescription>
            Configure your input and output devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-device">Microphone</Label>
            <div className="flex items-center gap-2">
              <Select value={inputDevice} onValueChange={setInputDevice}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {inputDevices.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleTestMicrophone}>Test</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="output-device">Speaker</Label>
            <div className="flex items-center gap-2">
              <Select value={outputDevice} onValueChange={setOutputDevice}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {outputDevices.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleTestSpeakers}>Test</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Screen Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Screen Sharing
          </CardTitle>
          <CardDescription>
            Configure your screen sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="screen-share-permissions">Screen Share Permissions</Label>
            <Select value={screenShare} onValueChange={setScreenShare}>
              <SelectTrigger>
                <SelectValue placeholder="Screen sharing permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Allow Always</SelectItem>
                <SelectItem value="ask">Ask Before Sharing</SelectItem>
                <SelectItem value="block">Block All Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            This setting applies to your created channels and private calls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
