
import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
}

export function TypingIndicator({ userNames, className }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else {
      return `${userNames[0]} and ${userNames.length - 1} others are typing...`;
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 text-sm text-muted-foreground p-3", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}
