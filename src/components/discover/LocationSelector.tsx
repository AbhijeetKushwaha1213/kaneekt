
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, MapIcon, Navigation, Map } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
}

export function LocationSelector({ isOpen, onClose, onSelectLocation }: LocationSelectorProps) {
  const [locationInput, setLocationInput] = useState("");
  const [radiusValue, setRadiusValue] = useState([10]);
  const [selectedLocation, setSelectedLocation] = useState<string>("current");

  const predefinedLocations = [
    { id: "current", label: "Use current location" },
    { id: "custom", label: "Custom location" }
  ];

  const recentSearches = [
    "New York, NY",
    "San Francisco, CA",
    "Chicago, IL"
  ];

  const handleSubmit = () => {
    if (selectedLocation === "current") {
      onSelectLocation(`Your Location (${radiusValue[0]}km radius)`);
    } else if (locationInput) {
      onSelectLocation(`${locationInput} (${radiusValue[0]}km radius)`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Select Location</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          <RadioGroup 
            value={selectedLocation} 
            onValueChange={setSelectedLocation}
            className="space-y-3"
          >
            {predefinedLocations.map((location) => (
              <div 
                key={location.id} 
                className="flex items-center space-x-3 border rounded-md p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setSelectedLocation(location.id)}
              >
                <RadioGroupItem value={location.id} id={location.id} />
                <Label htmlFor={location.id} className="flex items-center cursor-pointer flex-1">
                  {location.id === "current" ? (
                    <Navigation className="h-4 w-4 mr-2 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  {location.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {selectedLocation === "custom" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter city, address or landmark"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recent searches</p>
                  <div className="space-y-1">
                    {recentSearches.map((location, i) => (
                      <Button 
                        key={i} 
                        variant="ghost" 
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => setLocationInput(location)}
                      >
                        <MapIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Search radius</Label>
                <span className="text-sm text-muted-foreground">{radiusValue[0]} km</span>
              </div>
              <Slider
                value={radiusValue}
                onValueChange={setRadiusValue}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden h-40 bg-muted flex items-center justify-center">
              <Map className="h-10 w-10 text-muted-foreground" />
            </div>
            
            <Button onClick={handleSubmit} className="w-full">Apply Location</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
