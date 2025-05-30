
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageProps {
  onSend: (audioBlob: Blob) => void;
}

export function VoiceMessage({ onSend }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to send voice messages",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const sendVoiceMessage = () => {
    if (recordedBlob) {
      onSend(recordedBlob);
      setRecordedBlob(null);
      toast({
        title: "Voice message sent!",
        description: "Your voice message has been delivered"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!recordedBlob ? (
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={playRecording}
            disabled={isPlaying}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={sendVoiceMessage}>
            Send
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRecordedBlob(null)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
