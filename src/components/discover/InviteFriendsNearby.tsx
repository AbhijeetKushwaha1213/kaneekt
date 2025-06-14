
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function InviteFriendsNearby() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 mt-8">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
          <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium">Don't see your friends?</h3>
          <p className="text-sm text-muted-foreground">Invite them to join and see them nearby</p>
        </div>
      </div>
      <Button className="w-full mt-3" variant="outline">
        Invite Friends
      </Button>
    </div>
  );
}
