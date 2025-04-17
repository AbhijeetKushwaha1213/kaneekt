
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Plus, Search, X } from "lucide-react";
import { AuthUser } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface GroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreate: (groupData: {
    id: string;
    name: string;
    description: string;
    participants: {
      id: string;
      name: string;
      avatar?: string;
      role: 'admin' | 'member';
    }[];
  }) => void;
  currentUser: AuthUser | null;
}

export function GroupChatDialog({
  open,
  onOpenChange,
  onGroupCreate,
  currentUser
}: GroupChatDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load users from localStorage
  const loadUsers = () => {
    const storedUsers = localStorage.getItem("allUsers");
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setAllUsers(parsedUsers.filter((user: AuthUser) => 
          user.id !== currentUser?.id
        ));
      } catch (error) {
        console.error("Failed to parse users", error);
        setAllUsers([]);
      }
    } else {
      // Mock users for demo
      const mockUsers: AuthUser[] = [
        {
          id: "user1",
          name: "Emma Thompson",
          email: "emma@example.com",
          username: "emmat",
          avatar: "/placeholder.svg",
          isLoggedIn: true,
          bio: "Travel enthusiast and photography lover"
        },
        {
          id: "user2",
          name: "Michael Chen",
          email: "michael@example.com",
          username: "mikechen",
          avatar: "/placeholder.svg",
          isLoggedIn: false,
          bio: "Software developer and coffee addict"
        },
        {
          id: "user3",
          name: "Sofia Rodriguez",
          email: "sofia@example.com",
          username: "sofiar",
          avatar: "/placeholder.svg",
          isLoggedIn: true,
          bio: "Bookworm and aspiring writer"
        }
      ].filter(user => user.id !== currentUser?.id);
      
      setAllUsers(mockUsers);
    }
  };
  
  // Load users when the dialog opens
  useState(() => {
    if (open) {
      loadUsers();
    }
  });
  
  const filteredUsers = allUsers.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  const handleUserSelect = (user: AuthUser) => {
    setSelectedUsers(prev => [...prev, user]);
  };
  
  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast({
        title: "Add participants",
        description: "Please add at least one participant to your group",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Create group conversation object
    const groupId = `group-${uuidv4()}`;
    const newGroup = {
      id: groupId,
      name: groupName,
      description: groupDescription,
      participants: [
        ...(currentUser ? [{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'admin' as const
        }] : []),
        ...selectedUsers.map(user => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: 'member' as const
        }))
      ]
    };
    
    // Call the onGroupCreate callback
    onGroupCreate(newGroup);
    
    // Reset form
    setGroupName("");
    setGroupDescription("");
    setSelectedUsers([]);
    setSearchQuery("");
    setIsLoading(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Create a group chat with your contacts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input 
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-description">Group Description (Optional)</Label>
            <Textarea 
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="max-h-24"
            />
          </div>
          
          {/* Selected participants */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Participants ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => handleUserRemove(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* User search */}
          <div className="space-y-2">
            <Label htmlFor="participant-search">Add Participants</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="participant-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts"
                className="pl-9"
              />
            </div>
          </div>
          
          {/* User list */}
          <ScrollArea className="h-48 border rounded-md">
            <div className="p-2 space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {searchQuery ? "No contacts found" : "No contacts available"}
                </p>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user.id}
                    className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent text-left"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        {user.username && (
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        )}
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
