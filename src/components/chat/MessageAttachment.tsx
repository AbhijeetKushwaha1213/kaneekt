
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, File, Image, Video, Music } from 'lucide-react';

interface MessageAttachmentProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
}

export function MessageAttachment({
  fileName,
  fileType,
  fileSize,
  fileUrl,
  thumbnailUrl
}: MessageAttachmentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (fileType.startsWith('image/')) {
    return (
      <div className="mt-2 max-w-sm">
        <img
          src={thumbnailUrl || fileUrl}
          alt={fileName}
          className="rounded-lg max-h-60 w-auto object-contain cursor-pointer"
          onClick={() => window.open(fileUrl, '_blank')}
        />
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span className="truncate">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  if (fileType.startsWith('video/')) {
    return (
      <div className="mt-2 max-w-sm">
        <video
          src={fileUrl}
          className="rounded-lg max-h-60 w-auto object-contain"
          controls
          poster={thumbnailUrl}
        />
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span className="truncate">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 bg-accent/20 p-3 rounded-lg max-w-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-muted-foreground">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
