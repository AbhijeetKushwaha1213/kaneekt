
import { SettingsTab } from "@/pages/Settings";
import { AccountSettings } from "./sections/AccountSettings";
import { PrivacySettings } from "./sections/PrivacySettings";
import { NotificationSettings } from "./sections/NotificationSettings";
import { ChannelSettings } from "./sections/ChannelSettings";
import { DiscoverSettings } from "./sections/DiscoverSettings";
import { VoiceSettings } from "./sections/VoiceSettings";
import { AppearanceSettings } from "./sections/AppearanceSettings";
import { StorageSettings } from "./sections/StorageSettings";
import { SupportSettings } from "./sections/SupportSettings";
import { LegalSettings } from "./sections/LegalSettings";

interface SettingsContentProps {
  activeTab: SettingsTab;
}

export function SettingsContent({ activeTab }: SettingsContentProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      {activeTab === "account" && <AccountSettings />}
      {activeTab === "privacy" && <PrivacySettings />}
      {activeTab === "notifications" && <NotificationSettings />}
      {activeTab === "channels" && <ChannelSettings />}
      {activeTab === "discover" && <DiscoverSettings />}
      {activeTab === "voice" && <VoiceSettings />}
      {activeTab === "appearance" && <AppearanceSettings />}
      {activeTab === "storage" && <StorageSettings />}
      {activeTab === "support" && <SupportSettings />}
      {activeTab === "legal" && <LegalSettings />}
    </div>
  );
}
