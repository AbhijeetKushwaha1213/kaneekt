
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Compass } from "lucide-react";
import { POSTS, TOPIC_STYLES, groupPostsByTopic, DiscoverFeedCommonProps } from "@/utils/discoverFeedUtils";

interface DiscoverFeedCategoriesProps extends DiscoverFeedCommonProps {}

export function DiscoverFeedCategories({ topics = [] }: DiscoverFeedCategoriesProps) {
  const groupedPosts = groupPostsByTopic(POSTS);
  const filteredTopics = topics.length > 0 
    ? topics.filter(topic => groupedPosts[topic]) // Ensure topic exists in groupedPosts
    : Object.keys(groupedPosts);
  
  if (filteredTopics.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-lg border border-dashed">
        <div className="bg-muted/50 rounded-full p-4 mb-4">
          <Compass className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No topics found</h3>
        <p className="text-muted-foreground max-w-md mb-3">
          Select different topics to explore more content or no posts match the selected topics.
        </p>
        <Button variant="outline">Explore All Topics</Button>
      </div>
    );
  }

  return (
    <>
      {filteredTopics.map(topic => {
        const topicPosts = groupedPosts[topic] || [];
        // Fallback style for unknown topics
        const topicStyle = TOPIC_STYLES[topic] || { 
          color: 'bg-gray-50 text-gray-700 border-gray-200', 
          icon: <Compass className="h-5 w-5 text-gray-500" /> 
        };
        
        // Ensure color string can be split correctly
        const colorParts = topicStyle.color.split(' ');
        const bgColorClass = colorParts.length > 0 ? colorParts[0] : 'bg-gray-50';
        const borderColorClass = colorParts.length > 2 ? colorParts[2].replace('border-', '') : 'gray-200';


        return (
          <Card key={topic} className={`overflow-hidden border ${bgColorClass} border-${borderColorClass}`}>
            <div className={`flex items-center p-4 ${topicStyle.color}`}>
              <div className="mr-3">{topicStyle.icon}</div>
              <h2 className="text-lg font-medium capitalize">{topic}</h2>
              <div className="ml-auto text-sm font-medium">{topicPosts.length} posts</div>
            </div>
            <CardContent className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
              {topicPosts.slice(0, 2).map(post => (
                <div key={post.id} className="border rounded-md p-3 hover:bg-accent/20 cursor-pointer transition-colors bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.author.name}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="p-3 border-t bg-background/50">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                View all {topicPosts.length} posts in {topic}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
}
