
import React from "react";
import { DiscoverFeedCommonProps } from "@/utils/discoverFeedUtils";
import { DiscoverFeedGrid } from "./feed/DiscoverFeedGrid";
import { DiscoverFeedPosts } from "./feed/DiscoverFeedPosts";
import { DiscoverFeedCategories } from "./feed/DiscoverFeedCategories";

// Re-define DiscoverFeedProps if it's not already globally available or needs specific viewType
export interface DiscoverFeedProps extends DiscoverFeedCommonProps {
  viewType?: 'grid' | 'feed' | 'categories';
}

export function DiscoverFeed({ 
  searchQuery = "",
  selectedInterests = [],
  currentUserInterests = [],
  ageRange = [18, 50],
  sortBy = "trending",
  topics = [],
  viewType = "feed" // Default to feed view
}: DiscoverFeedProps) {

  if (viewType === 'grid') {
    return (
      <DiscoverFeedGrid
        searchQuery={searchQuery}
        selectedInterests={selectedInterests}
        currentUserInterests={currentUserInterests}
        ageRange={ageRange}
        sortBy={sortBy}
      />
    );
  } else if (viewType === 'categories') {
    return (
      <DiscoverFeedCategories
        topics={topics}
      />
    );
  } else if (viewType === 'feed') {
    return (
      <DiscoverFeedPosts
        sortBy={sortBy}
        topics={topics}
      />
    );
  }
  
  // Fallback or default view if viewType is not recognized
  // This can be an error message or a default component
  return <div className="col-span-full text-center py-8">Invalid view type selected.</div>;
}
