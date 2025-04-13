
import { format } from "date-fns";
import { Globe, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isPublic: boolean;
    image?: string;
  };
  userData: {
    name?: string;
    username?: string;
    avatar?: string;
  } | null;
  avatarUrl: string | null;
}

export function PostItem({ post, userData, avatarUrl }: PostItemProps) {
  return (
    <Card key={post.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || userData?.avatar || "/placeholder.svg"} alt={userData?.name || "User"} />
            <AvatarFallback>{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{userData?.name || "User"}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.timestamp), 'MMM d, yyyy')} • {post.isPublic ? 'Public' : 'Private'}
                </p>
              </div>
              <Badge variant={post.isPublic ? "outline" : "secondary"} className="ml-2">
                {post.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                {post.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            
            <p className="mt-2">{post.content}</p>
            
            {post.image && (
              <div className="mt-3">
                <img 
                  src={post.image} 
                  alt="Post image" 
                  className="rounded-md max-h-80 w-auto" 
                />
              </div>
            )}
            
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div>{post.likes} likes</div>
              <div>{post.comments} comments</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
