
import { Grid3X3, Bookmark, Users, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileTabsProps {
  posts: any[];
  isOwnProfile: boolean;
  onCreatePost: () => void;
}

export function ProfileTabs({ posts, isOwnProfile, onCreatePost }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-3 border-t">
        <TabsTrigger value="posts" className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden sm:inline">POSTS</span>
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">SAVED</span>
        </TabsTrigger>
        <TabsTrigger value="tagged" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">TAGGED</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-0">
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <Card key={post.id} className="aspect-square cursor-pointer group overflow-hidden">
                <CardContent className="p-0 relative h-full">
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500 text-sm text-center p-2">
                      {post.content.substring(0, 50)}...
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center text-white gap-4">
                      <div className="flex items-center">
                        <span className="font-semibold">{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold">{post.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-light mb-2">Share Posts</h3>
            <p className="text-gray-500">When you share posts, they will appear on your profile.</p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={onCreatePost}>
                Share your first post
              </Button>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="saved" className="mt-0">
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-light mb-2">Save</h3>
          <p className="text-gray-500">Save posts that you want to see again.</p>
        </div>
      </TabsContent>

      <TabsContent value="tagged" className="mt-0">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-light mb-2">Posts with you</h3>
          <p className="text-gray-500">When people tag you in posts, they'll appear here.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
