import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageReactionsProps {
  messageId: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '👎', '😂', '😮', '😢', '🔥', '👏'];

export function MessageReactions({ messageId }: MessageReactionsProps) {
  const { reactions, toggleReaction, loading } = useMessageReactions(messageId);
  const [showPicker, setShowPicker] = useState(false);
  const isMobile = useIsMobile();

  // Group reactions by emoji
  const reactionGroups = reactions.reduce<Record<string, typeof reactions>>((groups, reaction) => {
    if (!groups[reaction.emoji]) {
      groups[reaction.emoji] = [];
    }
    groups[reaction.emoji].push(reaction);
    return groups;
  }, {});

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction(emoji);
    setShowPicker(false);
  };

  return (
    <div className={cn("flex items-center gap-1 mt-1", isMobile ? "flex-wrap" : "")}>
      {/* Existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full bg-accent/50 hover:bg-accent",
            isMobile ? "h-7 px-2 text-xs" : "h-6 px-2 text-xs"
          )}
          onClick={() => handleReactionClick(emoji)}
          disabled={loading}
        >
          <span className="mr-1">{emoji}</span>
          <span className="text-xs">{reactionList.length}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full opacity-50 hover:opacity-100",
              isMobile ? "h-7 w-7 p-0" : "h-6 w-6 p-0"
            )}
          >
            <Smile className={cn(isMobile ? "h-4 w-4" : "h-3 w-3")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("w-auto p-2", isMobile ? "w-72" : "")} 
          align="start"
        >
          <div className={cn("grid gap-1", isMobile ? "grid-cols-6" : "grid-cols-4")}>
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-accent",
                  isMobile ? "h-10 w-10 p-0 text-xl" : "h-8 w-8 p-0 text-lg"
                )}
                onClick={() => handleReactionClick(emoji)}
                disabled={loading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
