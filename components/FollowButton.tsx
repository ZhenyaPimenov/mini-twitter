import { toggleFollow } from "@/app/actions/follows";

type FollowButtonProps = {
  userId: number;
  isFollowing: boolean;
  redirectTo: string;
  className?: string;
};

export default function FollowButton({
  userId,
  isFollowing,
  redirectTo,
  className,
}: FollowButtonProps) {
  return (
    <form action={toggleFollow}>
      <input type="hidden" name="followingId" value={userId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <button type="submit" className={className}>
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </form>
  );
}
