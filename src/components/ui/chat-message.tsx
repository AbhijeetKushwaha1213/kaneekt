
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    isCurrentUser: boolean;
  };
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  return (
    <div 
      className={cn(
        "flex items-end gap-2 group animate-in", 
        message.isCurrentUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {!message.isCurrentUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "px-4 py-2 rounded-2xl max-w-[80%] break-words",
        message.isCurrentUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-secondary text-secondary-foreground rounded-tl-none"
      )}>
        <div className="text-sm">{message.content}</div>
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
