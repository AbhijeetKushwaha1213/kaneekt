
interface ProfileStatsProps {
  postsCount: number;
  followers?: number;
  following?: number;
}

export function ProfileStats({ postsCount, followers = 0, following = 0 }: ProfileStatsProps) {
  return (
    <div className="flex border rounded-lg divide-x">
      <div className="flex-1 p-4 text-center">
        <div className="text-2xl font-bold">{postsCount}</div>
        <div className="text-sm text-muted-foreground">Posts</div>
      </div>
      <div className="flex-1 p-4 text-center">
        <div className="text-2xl font-bold">{followers}</div>
        <div className="text-sm text-muted-foreground">Followers</div>
      </div>
      <div className="flex-1 p-4 text-center">
        <div className="text-2xl font-bold">{following}</div>
        <div className="text-sm text-muted-foreground">Following</div>
      </div>
    </div>
  );
}
