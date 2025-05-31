
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchNotificationProps {
  userId: string;
  userName: string;
  userAvatar: string;
  onDismiss: () => void;
}

export function MatchNotification({ userId, userName, userAvatar, onDismiss }: MatchNotificationProps) {
  const navigate = useNavigate();

  const handleMessage = () => {
    navigate(`/chats/${userId}`);
    onDismiss();
  };

  return (
    <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-pink-200">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
              <Heart className="h-3 w-3 text-white fill-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-pink-900">It's a Match! 🎉</h3>
            <p className="text-sm text-pink-700">
              You and {userName} liked each other
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="border-pink-300 text-pink-700 hover:bg-pink-100"
            >
              Later
            </Button>
            <Button
              size="sm"
              onClick={handleMessage}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
