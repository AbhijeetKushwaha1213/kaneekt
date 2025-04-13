
import { MainLayout } from "@/components/layout/MainLayout";
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import { SettingsContent } from "@/components/settings/SettingsContent";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SettingsTab = 
  | "account" 
  | "privacy" 
  | "notifications" 
  | "channels" 
  | "discover" 
  | "voice" 
  | "appearance" 
  | "storage" 
  | "support" 
  | "legal";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login page if not authenticated
  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        {/* Mobile tabs */}
        <div className="block md:hidden mb-6">
          <Tabs 
            defaultValue="account"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SettingsTab)}
            className="w-full"
          >
            <TabsList className="w-full overflow-x-auto flex-wrap whitespace-nowrap h-auto py-1 justify-start">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="voice">Voice & Video</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className={cn(
          "flex gap-6",
          "flex-col md:flex-row"
        )}>
          {/* Desktop sidebar navigation */}
          <div className="hidden md:block w-64 shrink-0">
            <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Settings content */}
          <div className="flex-1">
            <SettingsContent activeTab={activeTab} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
