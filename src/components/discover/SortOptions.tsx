
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Clock, MapPin } from "lucide-react";

interface SortOptionsProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
          <SelectValue placeholder="Trending" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trending" className="flex items-center">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Trending</span>
            </div>
          </SelectItem>
          <SelectItem value="recent">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              <span>Most Recent</span>
            </div>
          </SelectItem>
          <SelectItem value="nearby">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-rose-500" />
              <span>Nearby</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
