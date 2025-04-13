
import { Button } from "@/components/ui/button";
import { 
  User, 
  Shield, 
  Bell, 
  Users, 
  Compass, 
  Mic, 
  PaintBucket, 
  HardDrive, 
  HelpCircle, 
  FileText,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "@/pages/Settings";

interface SettingsNavigationProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

interface NavItem {
  value: SettingsTab;
  label: string;
  icon: React.ElementType;
}

export function SettingsNavigation({ activeTab, setActiveTab }: SettingsNavigationProps) {
  const navItems: NavItem[] = [
    { value: "account", label: "Account", icon: User },
    { value: "privacy", label: "Privacy & Security", icon: Shield },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "channels", label: "Channel Management", icon: Users },
    { value: "discover", label: "Discover Feed", icon: Compass },
    { value: "voice", label: "Voice & Video", icon: Mic },
    { value: "appearance", label: "Appearance", icon: PaintBucket },
    { value: "storage", label: "Storage & Cache", icon: HardDrive },
    { value: "support", label: "Support & Feedback", icon: HelpCircle },
    { value: "legal", label: "Legal & Account", icon: FileText },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Button
          key={item.value}
          variant={activeTab === item.value ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start text-left font-normal",
            "h-11"
          )}
          onClick={() => setActiveTab(item.value)}
        >
          <item.icon className="w-4 h-4 mr-3" />
          <span className="flex-1">{item.label}</span>
          <ChevronRight className={cn(
            "h-4 w-4 opacity-0 transition-opacity",
            activeTab === item.value && "opacity-100"
          )} />
        </Button>
      ))}
    </nav>
  );
}
