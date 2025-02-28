
import { Link } from "react-router-dom";
import { Users, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/ui/interest-badge";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    description: string;
    members: number;
    tags: string[];
    isPrivate: boolean;
  };
  className?: string;
}

export function ChannelCard({ channel, className }: ChannelCardProps) {
  return (
    <Link to={`/channels/${channel.id}`}>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 h-full",
          "hover:shadow-md hover:border-primary/20",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {channel.name}
              {channel.isPrivate && (
                <Lock className="h-4 w-4 ml-2 inline-block text-muted-foreground" />
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {channel.members}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {channel.tags.map((tag) => (
              <InterestBadge key={tag} label={tag} />
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
          >
            {channel.isPrivate ? "Request to Join" : "Join Channel"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
