
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, PaintBucket, LanguagesIcon, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function AppearanceSettings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [accentColor, setAccentColor] = useState("default");
  
  // Demo function to simulate theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    document.documentElement.classList.toggle("dark", value === "dark");
    document.documentElement.classList.toggle("light", value === "light");
    
    toast({
      title: "Theme changed",
      description: `Theme set to ${value}.`
    });
  };
  
  // Determine initial theme from system preferences
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "system") {
      document.documentElement.classList.toggle("dark", prefersDark);
      document.documentElement.classList.toggle("light", !prefersDark);
    }
  }, [theme]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">
          Customize how your app looks and feels
        </p>
      </div>
      
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <Moon className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose between light mode, dark mode, or system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={handleThemeChange}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
          <p className="mt-2 text-sm text-muted-foreground">
            System setting follows your device's appearance settings.
          </p>
        </CardContent>
      </Card>
      
      {/* Font Size Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Size
          </CardTitle>
          <CardDescription>
            Adjust text size for better readability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="font-size">Text Size</Label>
            <Select value={fontSize} onValueChange={(value) => {
              setFontSize(value);
              toast({
                title: "Font size updated",
                description: `Font size set to ${value}.`
              });
            }}>
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="x-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              This sample text will show the approximate size.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LanguagesIcon className="h-5 w-5" />
            Language
          </CardTitle>
          <CardDescription>
            Select your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Application Language</Label>
            <Select value={language} onValueChange={(value) => {
              setLanguage(value);
              toast({
                title: "Language updated",
                description: `Language set to ${value === 'en' ? 'English' : 
                  value === 'es' ? 'Spanish' : 
                  value === 'fr' ? 'French' : 
                  value === 'de' ? 'German' : 
                  'selected language'}.`
              });
            }}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Accent Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaintBucket className="h-5 w-5" />
            Accent Color
          </CardTitle>
          <CardDescription>
            Choose an accent color for buttons and highlights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={accentColor} onValueChange={setAccentColor}>
            <TabsList className="grid grid-cols-5 h-auto">
              <TabsTrigger value="default" className="bg-primary h-8 w-8 p-0 data-[state=active]:border-2 border-ring" />
              <TabsTrigger value="blue" className="bg-blue-500 h-8 w-8 p-0 data-[state=active]:border-2 border-ring" />
              <TabsTrigger value="green" className="bg-green-500 h-8 w-8 p-0 data-[state=active]:border-2 border-ring" />
              <TabsTrigger value="purple" className="bg-purple-500 h-8 w-8 p-0 data-[state=active]:border-2 border-ring" />
              <TabsTrigger value="rose" className="bg-rose-500 h-8 w-8 p-0 data-[state=active]:border-2 border-ring" />
            </TabsList>
          </Tabs>
          <p className="mt-2 text-sm text-muted-foreground">
            Accent color changes require app restart to take full effect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
