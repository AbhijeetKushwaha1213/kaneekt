
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InterestBadge } from "@/components/ui/interest-badge";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    location?: string;
    avatar?: string;
    bio: string;
    interests: string[];
    distance?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function UserCard({ user, className, style }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Message sent",
      description: `You've initiated a chat with ${user.name}. Wait for them to accept.`,
    });
  };

  return (
    <Link to={`/profile/${user.id}`}>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 h-full",
          "hover:shadow-md hover:border-primary/20 cursor-pointer",
          "transform-gpu",
          isHovered && "scale-[1.02]",
          className
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "w-full aspect-square relative overflow-hidden",
          "transition-transform duration-500",
          isHovered && "scale-[1.03]"
        )}>
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage 
              src={user.avatar || "/placeholder.svg"} 
              alt={user.name} 
              className="object-cover"
            />
            <AvatarFallback className="w-full h-full rounded-none text-4xl">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <h3 className="text-xl font-medium text-white">{user.name}, {user.age}</h3>
            {user.location && (
              <div className="flex items-center text-white/90 text-sm mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>
                  {user.location}
                  {user.distance && ` · ${user.distance} km away`}
                </span>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-1">
            {user.interests.slice(0, 4).map((interest) => (
              <InterestBadge 
                key={interest} 
                label={interest}
              />
            ))}
            {user.interests.length > 4 && (
              <InterestBadge 
                label={`+${user.interests.length - 4}`}
                className="bg-muted text-muted-foreground"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <Button 
            onClick={handleMessage}
            className="w-full"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
