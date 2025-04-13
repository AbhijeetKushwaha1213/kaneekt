
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProfileData: Partial<User>;
  setEditProfileData: (data: Partial<User>) => void;
  handleSaveProfile: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  editProfileData,
  setEditProfileData,
  handleSaveProfile
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editProfileData.name || ''}
              onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={editProfileData.location || ''}
              onChange={(e) => setEditProfileData({...editProfileData, location: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender
            </Label>
            <Input
              id="gender"
              value={editProfileData.gender || ''}
              onChange={(e) => setEditProfileData({...editProfileData, gender: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={editProfileData.dob || ''}
              onChange={(e) => setEditProfileData({...editProfileData, dob: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <textarea
              id="bio"
              value={editProfileData.bio || ''}
              onChange={(e) => setEditProfileData({...editProfileData, bio: e.target.value})}
              className="col-span-3 p-2 border rounded-md h-24 resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveProfile}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
