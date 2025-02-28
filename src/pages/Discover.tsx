
import { useState } from "react";
import { SearchFilters } from "@/components/ui/search-filters";
import { UserCard } from "@/components/ui/user-card";
import { MainLayout } from "@/components/layout/MainLayout";
import { USERS } from "@/data/mock-data";
import { User } from "@/types";

export default function Discover() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(USERS);
  
  const handleSearch = (filters: any) => {
    // Apply filters to the users data
    let results = [...USERS];
    
    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        user => 
          user.name.toLowerCase().includes(query) ||
          user.interests.some(interest => 
            interest.toLowerCase().includes(query)
          )
      );
    }
    
    // Filter by distance
    if (filters.distance) {
      results = results.filter(
        user => !user.distance || user.distance <= filters.distance
      );
    }
    
    // Filter by age range
    if (filters.ageRange) {
      results = results.filter(
        user => user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1]
      );
    }
    
    // Filter by interests
    if (filters.interests && filters.interests.length > 0) {
      results = results.filter(
        user => filters.interests.some((interest: string) => 
          user.interests.includes(interest)
        )
      );
    }
    
    setFilteredUsers(results);
  };
  
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Discover People</h1>
          <p className="text-muted-foreground">
            Find people who share your interests and connect with them
          </p>
        </div>
        
        <SearchFilters onSearch={handleSearch} />
        
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try adjusting your search filters to find more people
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <UserCard 
                key={user.id} 
                user={user}
                className={`animate-in fade-in-up stagger-${(index % 5) + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
