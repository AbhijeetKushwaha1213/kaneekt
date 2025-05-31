
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣',
    '💤', '💢', '💦', '💨', '👋', '🤚', '🖐️', '✋'
  ];

  return (
    <Card className="w-72">
      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
