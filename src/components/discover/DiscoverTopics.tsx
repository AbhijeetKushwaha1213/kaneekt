
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface DiscoverTopicsProps {
  selectedTopics: string[];
  onTopicSelect: (topic: string) => void;
}

const TOPICS = [
  { id: 'tech', label: '💻 Tech', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
  { id: 'fitness', label: '💪 Fitness', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
  { id: 'food', label: '🍕 Food', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800' },
  { id: 'art', label: '🎨 Art', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800' },
  { id: 'music', label: '🎵 Music', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800' },
  { id: 'events', label: '🎉 Events', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
  { id: 'games', label: '🎮 Games', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
  { id: 'sport', label: '⚽ Sports', color: 'bg-sky-100 hover:bg-sky-200 text-sky-800' },
];

export function DiscoverTopics({ selectedTopics, onTopicSelect }: DiscoverTopicsProps) {
  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
      {TOPICS.map((topic) => (
        <div 
          key={topic.id}
          className={`cursor-pointer transition-all duration-200 transform ${
            selectedTopics.includes(topic.id) ? 'scale-105' : ''
          }`}
          onClick={() => onTopicSelect(topic.id)}
        >
          <Badge 
            variant="outline"
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedTopics.includes(topic.id) 
                ? `${topic.color} border-0` 
                : 'bg-transparent hover:bg-gray-100'
            }`}
          >
            {topic.label}
          </Badge>
        </div>
      ))}
    </div>
  );
}
