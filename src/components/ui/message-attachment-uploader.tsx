
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Image as ImageIcon, File, Mic, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

export type AttachmentType = 'image' | 'video' | 'document' | 'voice' | 'location';

interface MessageAttachmentUploaderProps {
  onAttachmentSelect: (file: File, type: AttachmentType) => void;
  onAttachmentRemove: () => void;
  currentAttachment: {
    file: File;
    type: AttachmentType;
    preview?: string;
  } | null;
}

export function MessageAttachmentUploader({
  onAttachmentSelect,
  onAttachmentRemove,
  currentAttachment
}: MessageAttachmentUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: AttachmentType) => {
    if (e.target.files && e.target.files[0]) {
      onAttachmentSelect(e.target.files[0], type);
      e.target.value = ''; // Reset input
    }
  };
  
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const fileName = `voice-message-${Date.now()}.wav`;
        // Create a File from Blob correctly with only the required arguments
        const audioFile = new File([audioBlob], fileName);
        onAttachmentSelect(audioFile, 'voice');
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };
  
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordingDuration(0);
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };
  
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = {
            latitude,
            longitude,
            timestamp: new Date().toISOString()
          };
          
          // Convert location to a JSON file
          const locationBlob = new Blob([JSON.stringify(locationData)], { type: 'application/json' });
          // Create a File from Blob correctly with only the required arguments
          const locationFile = new File([locationBlob], 'location.json');
          
          onAttachmentSelect(locationFile, 'location');
          
          toast({
            title: "Location shared",
            description: `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location access denied",
            description: "Please allow location access to share your location",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser does not support location sharing",
        variant: "destructive"
      });
    }
  };
  
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center">
      {isRecording ? (
        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full text-red-500 animate-pulse">
          <span>● Recording</span>
          <span className="text-xs">{formatRecordingTime(recordingDuration)}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={stopVoiceRecording} 
            className="ml-2 h-6 text-xs"
          >
            Stop
          </Button>
        </div>
      ) : currentAttachment ? (
        <div className="relative bg-accent/20 rounded-md p-2 pr-10 inline-block max-w-full flex items-center gap-2">
          {currentAttachment.type === 'image' && currentAttachment.preview ? (
            <img 
              src={currentAttachment.preview} 
              alt="Attachment preview" 
              className="h-9 w-auto rounded-md object-cover" 
            />
          ) : currentAttachment.type === 'video' ? (
            <video
              src={currentAttachment.preview}
              className="h-9 max-w-[60px] rounded-md" 
            />
          ) : currentAttachment.type === 'voice' ? (
            <Mic className="h-6 w-6 text-primary" />
          ) : currentAttachment.type === 'location' ? (
            <MapPin className="h-6 w-6 text-primary" />
          ) : (
            <File className="h-6 w-6 text-primary" />
          )}
          
          <span className="text-sm truncate max-w-[200px]">
            {currentAttachment.type === 'location' 
              ? 'Location' 
              : currentAttachment.file.name}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 absolute top-1 right-1 hover:bg-accent/50 rounded-full"
            onClick={onAttachmentRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Add attachment">
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start" side="top">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 gap-1"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Photo</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 gap-1"
                onClick={() => videoInputRef.current?.click()}
              >
                <video
                  className="h-5 w-5" 
                />
                <span className="text-xs">Video</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 gap-1"
                onClick={() => documentInputRef.current?.click()}
              >
                <File className="h-5 w-5" />
                <span className="text-xs">File</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 gap-1"
                onMouseDown={startVoiceRecording}
                onTouchStart={startVoiceRecording}
              >
                <Mic className="h-5 w-5" />
                <span className="text-xs">Voice</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-16 gap-1"
                onClick={handleLocationShare}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Location</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {/* Hidden file inputs */}
      <input 
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      
      <input 
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={(e) => handleFileSelect(e, 'video')}
      />
      
      <input 
        type="file"
        ref={documentInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={(e) => handleFileSelect(e, 'document')}
      />
    </div>
  );
}
