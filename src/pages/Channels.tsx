
import { useState } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { ChannelCard } from "@/components/ui/channel-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Channels() {
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(CHANNELS);
  
  const handleSearch = (filters: any) => {
    // Apply filters to the channels data
    let results = [...CHANNELS];
    
    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        channel => 
          channel.name.toLowerCase().includes(query) ||
          channel.description.toLowerCase().includes(query) ||
          channel.tags.some(tag => 
            tag.toLowerCase().includes(query)
          )
      );
    }
    
    // Filter by interests/tags
    if (filters.interests && filters.interests.length > 0) {
      results = results.filter(
        channel => filters.interests.some((interest: string) => 
          channel.tags.includes(interest)
        )
      );
    }
    
    setFilteredChannels(results);
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interest Channels</h1>
            <p className="text-muted-foreground">
              Join discussions and meet people in topic-based channels
            </p>
          </div>
          <Button size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </div>
        
        <SearchFilters onSearch={handleSearch} />
        
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No channels found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try adjusting your search filters or create a new channel
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel, index) => (
              <ChannelCard 
                key={channel.id} 
                channel={channel}
                className={`animate-in fade-in-up stagger-${(index % 5) + 1}`}
              />
            ))}
          </div>
        )}
        
        <div className="flex justify-center sm:hidden mt-8">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
