
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Check, CheckCheck, Reply, Star, StarOff,
  MoreVertical, Copy, Forward, Trash2
} from "lucide-react";
import { Message, Reaction } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MessageReactions } from "@/components/chat/MessageReactions";
import { MessageAttachment } from "@/components/chat/MessageAttachment";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessageProps {
  message: Message;
  className?: string;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onStar?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onForward?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  className,
  onReply,
  onDelete,
  onReact,
  onStar,
  onCopy,
  onForward
}: ChatMessageProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLongPress = () => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowActions(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast({ description: "Text copied to clipboard" });
    }
    
    if (onCopy) onCopy(message.content);
    setShowActions(false);
  };
  
  const getMessageStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground ml-1" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground ml-1" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary ml-1" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-end gap-2 group animate-in", 
        message.isCurrentUser ? "flex-row-reverse" : "flex-row",
        isMobile ? "px-2" : "",
        className
      )}
      onTouchStart={handleLongPress}
      onTouchEnd={handlePressEnd}
      onMouseDown={!isMobile ? handleLongPress : undefined}
      onMouseUp={!isMobile ? handlePressEnd : undefined}
      onMouseLeave={!isMobile ? handlePressEnd : undefined}
    >
      {!message.isCurrentUser && (
        <Avatar className={cn("flex-shrink-0", isMobile ? "h-6 w-6" : "h-8 w-8")}>
          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("relative", isMobile ? "max-w-[85%]" : "max-w-[70%]")}>
        {/* Reply reference if this message is a reply */}
        {message.replyTo && (
          <div className={cn(
            "px-3 py-1 text-xs rounded-lg mb-1 opacity-80",
            message.isCurrentUser 
              ? "bg-primary/20 text-primary-foreground/90 rounded-tr-none ml-auto" 
              : "bg-secondary/20 text-secondary-foreground/90 rounded-tl-none mr-auto"
          )}>
            <p className="font-medium">{message.replyTo.sender.name}</p>
            <p className="line-clamp-1">{message.replyTo.content}</p>
          </div>
        )}
        
        {/* Main message content */}
        <div className={cn(
          "px-4 py-2 rounded-2xl break-words relative",
          isMobile ? "px-3 py-2 text-sm" : "px-4 py-2",
          message.isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-secondary text-secondary-foreground rounded-tl-none"
        )}>
          <div className={cn("break-words", isMobile ? "text-sm" : "text-sm")}>
            {message.content}
          </div>
          
          {/* Message attachments */}
          {message.attachment && (
            <MessageAttachment
              fileName={message.attachment.name}
              fileType={message.attachment.type}
              fileSize={0}
              fileUrl={message.attachment.url}
            />
          )}
          
          {/* Time and status */}
          <div className="flex items-center justify-end mt-1 gap-1">
            <span className={cn("opacity-70", isMobile ? "text-[0.6rem]" : "text-[0.65rem]")}>
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
            {message.isCurrentUser && getMessageStatusIcon()}
            {message.isStarred && (
              <Star className={cn("text-yellow-500 ml-1", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
            )}
          </div>
        </div>
        
        {/* Message reactions */}
        <MessageReactions messageId={message.id} />
        
        {/* Message actions dropdown */}
        <DropdownMenu open={showActions} onOpenChange={setShowActions}>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "absolute top-1 right-1 p-1 hover:bg-background/20 rounded-full transition-opacity",
                isMobile 
                  ? showActions ? "opacity-100" : "opacity-0"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100"
              )}
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={message.isCurrentUser ? "end" : "start"}
            className={cn(isMobile ? "text-base" : "")}
          >
            <DropdownMenuItem onClick={() => { onReply?.(message.id); setShowActions(false); }}>
              <Reply className="h-4 w-4 mr-2" /> Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onForward?.(message.id); setShowActions(false); }}>
              <Forward className="h-4 w-4 mr-2" /> Forward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onStar?.(message.id); setShowActions(false); }}>
              {message.isStarred ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" /> Unstar
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" /> Star
                </>
              )}
            </DropdownMenuItem>
            {message.isCurrentUser && (
              <DropdownMenuItem 
                onClick={() => { onDelete?.(message.id); setShowActions(false); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Hover timestamp - hidden on mobile */}
      {!isMobile && (
        <span className={cn(
          "text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
          message.isCurrentUser ? "mr-2" : "ml-2"
        )}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
