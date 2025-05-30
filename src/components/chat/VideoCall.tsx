
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  recipientName: string;
  onCall: () => void;
}

export function VideoCall({ recipientName, onCall }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const { toast } = useToast();

  const startCall = () => {
    setIsCallActive(true);
    onCall();
    toast({
      title: "Video call started",
      description: `Calling ${recipientName}...`
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    toast({
      title: "Call ended",
      description: "Video call has been terminated"
    });
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={startCall}>
        <Video className="h-4 w-4" />
      </Button>

      <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Call with {recipientName}</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {/* Mock video feed */}
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Video call simulation with {recipientName}</p>
            </div>
            
            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="icon"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="icon"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button variant="destructive" size="icon" onClick={endCall}>
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
