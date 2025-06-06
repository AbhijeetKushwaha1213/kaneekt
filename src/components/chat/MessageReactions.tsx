import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '👎', '😂', '😮', '😢', '🔥', '👏'];

export function MessageReactions({ messageId }: MessageReactionsProps) {
  const { reactions, toggleReaction, loading } = useMessageReactions(messageId);
  const [showPicker, setShowPicker] = useState(false);

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
    <div className="flex items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs rounded-full bg-accent/50 hover:bg-accent"
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
            className="h-6 w-6 p-0 rounded-full opacity-50 hover:opacity-100"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
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
