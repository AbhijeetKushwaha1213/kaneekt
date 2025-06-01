
interface ProfileStatsRowProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function ProfileStatsRow({ postsCount, followersCount, followingCount }: ProfileStatsRowProps) {
  return (
    <div className="flex justify-center md:justify-start gap-8 mb-4">
      <div className="text-center">
        <span className="font-semibold">{postsCount}</span>
        <span className="text-gray-600 ml-1">posts</span>
      </div>
      <div className="text-center">
        <span className="font-semibold">{followersCount}</span>
        <span className="text-gray-600 ml-1">followers</span>
      </div>
      <div className="text-center">
        <span className="font-semibold">{followingCount}</span>
        <span className="text-gray-600 ml-1">following</span>
      </div>
    </div>
  );
}
