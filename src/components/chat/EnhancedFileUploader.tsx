
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Image,
  Video,
  Music,
  FileText,
  X
} from 'lucide-react';

interface EnhancedFileUploaderProps {
  onFileUploaded: (attachment: any) => void;
  messageId: string;
  onClose: () => void;
}

export function EnhancedFileUploader({
  onFileUploaded,
  messageId,
  onClose
}: EnhancedFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const result = await uploadFile(file, messageId);
    if (result) {
      onFileUploaded(result);
      onClose();
    }
  };

  const triggerFileInput = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload File</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {uploading && (
          <div className="mb-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => triggerFileInput('image/*')}
            disabled={uploading}
          >
            <Image className="h-6 w-6" />
            <span className="text-xs">Photos</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => triggerFileInput('video/*')}
            disabled={uploading}
          >
            <Video className="h-6 w-6" />
            <span className="text-xs">Videos</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => triggerFileInput('audio/*')}
            disabled={uploading}
          >
            <Music className="h-6 w-6" />
            <span className="text-xs">Audio</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => triggerFileInput('.pdf,.doc,.docx,.txt')}
            disabled={uploading}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Documents</span>
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3 flex items-center gap-2"
          onClick={() => triggerFileInput()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          Browse All Files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
