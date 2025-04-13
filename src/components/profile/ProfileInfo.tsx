
import { Lock, MapPin } from "lucide-react";
import { User } from "@/types";

interface ProfileInfoProps {
  userData: {
    name?: string;
    username?: string;
  } | null;
  profileData: User | null;
  isPrivate: boolean;
  getAge: () => number | null;
}

export function ProfileInfo({ userData, profileData, isPrivate, getAge }: ProfileInfoProps) {
  return (
    <div className="mt-20 md:pl-44 flex flex-col md:flex-row md:justify-between md:items-end">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{userData?.name || "User"}</h1>
          {isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-muted-foreground">@{userData?.username || "username"}</p>
        <div className="flex items-center gap-3 text-muted-foreground mt-1 flex-wrap">
          {profileData?.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {profileData.location}
            </div>
          )}
          {getAge() && (
            <>
              <span>•</span>
              <div>{getAge()} years old</div>
            </>
          )}
          {profileData?.gender && (
            <>
              <span>•</span>
              <div>{profileData.gender}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
