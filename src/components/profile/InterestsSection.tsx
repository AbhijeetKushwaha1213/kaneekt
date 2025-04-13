
import { Edit, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/ui/interest-badge";

interface InterestsSectionProps {
  interests: string[];
}

export function InterestsSection({ interests }: InterestsSectionProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-medium">Interests</h2>
          <Button variant="ghost" size="sm" className="h-8">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <InterestBadge key={interest} label={interest} />
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-7 px-3"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
