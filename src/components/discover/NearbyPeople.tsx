
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { USERS } from "@/data/mock-data";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function NearbyPeople() {
  // Get nearest users (with lowest distance values)
  const nearbyUsers = [...USERS]
    .filter(user => typeof user.distance === 'number')
    .sort((a, b) => (a.distance || 99) - (b.distance || 99))
    .slice(0, 6);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3 flex items-center">
        <span className="mr-2">👥</span> People Near You
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {nearbyUsers.map((user) => (
            <CarouselItem key={user.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="relative">
                  {/* Online status indicator */}
                  <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
                    user.id.charCodeAt(0) % 2 === 0 ? 'bg-green-500' : 'bg-amber-500'
                  } ring-2 ring-white`}></div>
                  
                  <div className="aspect-[3/2] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"></div>
                  
                  <div className="absolute -bottom-6 left-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <div className="text-xs text-muted-foreground flex flex-col">
                        <span>{user.distance} km away</span>
                        <span className="mt-1 text-xs">
                          {user.interests.slice(0, 2).join(' • ')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Connect</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>
    </div>
  );
}
