
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { GroupCreation } from "@/components/groups/GroupCreation";

interface Group {
  name: string;
  members: number;
  topic: string;
  description: string;
}

const mockGroupData: Group[] = [
  { name: "Philosophy Discussions", members: 45, topic: "Philosophy", description: "Deep conversations about consciousness, ethics, and reality" },
  { name: "Photography Club", members: 128, topic: "Photography", description: "Share photos, tips, and organize photo walks" },
  { name: "Book Lovers", members: 89, topic: "Reading", description: "Monthly book discussions and recommendations" },
  { name: "Fitness Buddies", members: 156, topic: "Fitness", description: "Workout tips, motivation, and group challenges" },
  { name: "Tech Talk", members: 203, topic: "Technology", description: "Latest tech trends, coding tips, and project collaboration" },
  { name: "Cooking Together", members: 67, topic: "Cooking", description: "Recipe sharing and virtual cooking sessions" }
];

interface DiscoverGroupsTabProps {
  containerVariants: Variants;
  itemVariants: Variants;
}

export function DiscoverGroupsTab({ containerVariants, itemVariants }: DiscoverGroupsTabProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Interest Groups</h2>
          <p className="text-muted-foreground">Join group chats with people who share your interests</p>
        </div>
        <GroupCreation />
      </div>
      
      <motion.div 
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockGroupData.map((group) => (
          <motion.div 
            key={group.name} 
            className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
            variants={itemVariants}
          >
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {group.members} members
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{group.topic}</Badge>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Join</Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
