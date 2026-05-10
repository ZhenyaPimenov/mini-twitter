import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { notFound } from "next/navigation";

type UserProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  const [profileUser, posts] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        followers: {
          where: {
            followerId: currentUser?.id ?? -1,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isFollowing = profileUser.followers.length > 0;
  const displayName = profileUser.username ?? profileUser.email;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/"
                className="text-blue-400 transition hover:text-blue-300"
              >
                ← Home
              </Link>

              <Link
                href="/tweets"
                className="text-blue-400 transition hover:text-blue-300"
              >
                Tweets
              </Link>
            </div>

            <h1 className="mt-3 text-3xl font-bold">{displayName}</h1>
          </div>

          {currentUser ? (
            !isOwnProfile && (
              <FollowButton
                userId={profileUser.id}
                isFollowing={isFollowing}
                redirectTo={`/users/${profileUser.id}`}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              />
            )
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              Log in to follow
            </Link>
          )}
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">User profile</p>

          <h2 className="mt-1 text-2xl font-semibold">{displayName}</h2>

          <p className="mt-2 text-sm text-zinc-400">{profileUser.email}</p>

          <p className="mt-1 text-sm text-zinc-500">
            Joined {new Date(profileUser.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{profileUser._count.posts}</p>
              <p className="text-sm text-zinc-400">Tweets</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">
                {profileUser._count.followers}
              </p>
              <p className="text-sm text-zinc-400">Followers</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">
                {profileUser._count.following}
              </p>
              <p className="text-sm text-zinc-400">Following</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Tweets</h2>

          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-300">
                This user has not posted any tweets yet.
              </div>
            )}

            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex flex-wrap gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
                    {post.topic}
                  </p>

                  <p className="text-xs font-medium uppercase tracking-wide text-purple-300">
                    {post.mood}
                  </p>
                </div>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  {post.title}
                </h3>

                <p className="mt-2 text-zinc-200">{post.content}</p>

                <p className="mt-2 text-sm text-zinc-400">
                  {new Date(post.createdAt).toLocaleString()} ·{" "}
                  {post._count.likes} likes
                </p>

                <Link
                  href={`/tweets/${post.id}`}
                  className="mt-3 inline-block text-sm text-blue-400 transition hover:text-blue-300"
                >
                  Open details
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
