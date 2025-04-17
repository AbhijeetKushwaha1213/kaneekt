
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  File, Image as ImageIcon, Mic, Video, 
  MapPin, Check, CheckCheck, Reply, Star, StarOff,
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

const EMOJI_REACTIONS = ["❤️", "👍", "👎", "😂", "😮", "😢", "🔥"];

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
  const [showReactions, setShowReactions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleLongPress = () => {
    const timer = setTimeout(() => {
      setShowReactions(true);
    }, 500);
    setLongPressTimer(timer);
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
  
  // Handle emoji reactions display
  const reactionGroups = message.reactions?.reduce<Record<string, string[]>>((groups, reaction) => {
    if (!groups[reaction.emoji]) {
      groups[reaction.emoji] = [];
    }
    if (reaction.userName) {
      groups[reaction.emoji].push(reaction.userName);
    }
    return groups;
  }, {}) || {};

  return (
    <div 
      className={cn(
        "flex items-end gap-2 group animate-in", 
        message.isCurrentUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      onTouchStart={handleLongPress}
      onTouchEnd={handlePressEnd}
      onMouseDown={handleLongPress}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
    >
      {!message.isCurrentUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className="relative">
        {/* Reply reference if this message is a reply */}
        {message.replyTo && (
          <div className={cn(
            "px-3 py-1 text-xs rounded-lg mb-1 max-w-[80%] opacity-80",
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
          "px-4 py-2 rounded-2xl max-w-[80%] break-words relative",
          message.isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-secondary text-secondary-foreground rounded-tl-none"
        )}>
          <div className="text-sm">{message.content}</div>
          
          {/* Message attachments */}
          {message.attachment && (
            <div className="mt-2">
              {message.attachment.type === 'image' ? (
                <div className="mt-2">
                  <img 
                    src={message.attachment.url} 
                    alt={message.attachment.name} 
                    className="rounded-md max-h-60 w-auto object-contain cursor-pointer"
                    onClick={() => {
                      // Image viewer logic would go here
                      window.open(message.attachment.url, '_blank');
                    }}
                  />
                  <p className="text-xs mt-1 opacity-70">{message.attachment.name}</p>
                </div>
              ) : message.attachment.type === 'video' ? (
                <div className="mt-2">
                  <video 
                    src={message.attachment.url} 
                    className="rounded-md max-h-60 w-auto object-contain" 
                    controls
                  />
                  <p className="text-xs mt-1 opacity-70">{message.attachment.name}</p>
                </div>
              ) : message.attachment.type === 'voice' ? (
                <div className="flex items-center gap-2 mt-2">
                  <Mic className="h-5 w-5" />
                  <audio src={message.attachment.url} controls className="h-8 max-w-[200px]" />
                </div>
              ) : message.attachment.type === 'location' ? (
                <div className="mt-2">
                  <div className="bg-background/20 p-2 rounded-md flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs">Location shared</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-background/20 p-2 rounded-md mt-2">
                  <File className="h-5 w-5" />
                  <span className="text-xs truncate">{message.attachment.name}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Time and status */}
          <div className="flex items-center justify-end mt-1 gap-1">
            <span className="text-[0.65rem] opacity-70">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
            {message.isCurrentUser && getMessageStatusIcon()}
            {message.isStarred && (
              <Star className="h-3 w-3 text-yellow-500 ml-1" />
            )}
          </div>
          
          {/* Emoji reactions container */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 bg-background rounded-full px-2 py-1 shadow-md flex items-center gap-1 text-sm border">
              {Object.entries(reactionGroups).map(([emoji, users]) => (
                <div key={emoji} className="flex items-center gap-1" title={users.join(', ')}>
                  <span>{emoji}</span>
                  <span className="text-xs text-muted-foreground">{users.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Emoji reaction picker - shown on long press */}
        {showReactions && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-background border shadow-lg rounded-full py-1 px-2 flex items-center gap-1 z-10">
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                className="hover:bg-muted rounded-full p-1 transition-colors"
                onClick={() => {
                  onReact?.(message.id, emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        {/* Message actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:bg-background/20 rounded-full transition-opacity">
              <MoreVertical className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={message.isCurrentUser ? "end" : "start"}>
            <DropdownMenuItem onClick={() => onReply?.(message.id)}>
              <Reply className="h-4 w-4 mr-2" /> Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onForward?.(message.id)}>
              <Forward className="h-4 w-4 mr-2" /> Forward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStar?.(message.id)}>
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
                onClick={() => onDelete?.(message.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <span className={cn(
        "text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
        message.isCurrentUser ? "mr-2" : "ml-2"
      )}>
        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
      </span>
    </div>
  );
}
