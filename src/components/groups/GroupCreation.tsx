
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GroupCreation() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const mockFriends = [
    { id: '1', name: 'Sarah Chen', avatar: '/placeholder.svg' },
    { id: '2', name: 'Marcus Johnson', avatar: '/placeholder.svg' },
    { id: '3', name: 'Elena Rodriguez', avatar: '/placeholder.svg' },
    { id: '4', name: 'David Kim', avatar: '/placeholder.svg' }
  ];

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const createGroup = () => {
    if (groupName && selectedMembers.length > 0) {
      // Store group in localStorage for demo
      const groups = JSON.parse(localStorage.getItem('userGroups') || '[]');
      const newGroup = {
        id: `group-${Date.now()}`,
        name: groupName,
        description: groupDescription,
        members: selectedMembers,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user'
      };
      groups.push(newGroup);
      localStorage.setItem('userGroups', JSON.stringify(groups));

      toast({
        title: "Group created! 🎉",
        description: `${groupName} has been created with ${selectedMembers.length} members`
      });

      setIsOpen(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          
          <div>
            <Label htmlFor="group-description">Description (Optional)</Label>
            <Textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Add Members</Label>
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
              {mockFriends.map(friend => (
                <div
                  key={friend.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMembers.includes(friend.id)
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => handleMemberToggle(friend.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{friend.name}</span>
                  </div>
                  {selectedMembers.includes(friend.id) && (
                    <Badge variant="default" className="text-xs">
                      Added
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={createGroup} 
            className="w-full"
            disabled={!groupName || selectedMembers.length === 0}
          >
            Create Group ({selectedMembers.length} members)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
