
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, FileText, Video, Music } from 'lucide-react';

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void;
}

export function FileUploader({ onFilesUpload }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesUpload(files);
    }
  };

  const triggerFileInput = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerFileInput('image/*')}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Images
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerFileInput('video/*')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Videos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerFileInput('audio/*')}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Audio
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerFileInput('.pdf,.doc,.docx,.txt')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Documents
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerFileInput()}
            className="flex items-center gap-2 col-span-2"
          >
            <Upload className="h-4 w-4" />
            All Files
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
