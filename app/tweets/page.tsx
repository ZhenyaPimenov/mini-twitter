import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import DeleteTweetButton from "@/components/DeleteTweetButton";
import FollowButton from "@/components/FollowButton";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

type TweetsPageProps = {
  searchParams?: Promise<{
    success?: string;
    topic?: string;
  }>;
};

const TWEET_TOPICS = ["General", "Study", "News", "Project", "Personal"];

const tweetSuccessMessages: Record<string, string> = {
  created: "Tweet posted.",
  updated: "Tweet updated.",
  deleted: "Tweet deleted.",
};

export default async function TweetsPage({ searchParams }: TweetsPageProps) {
  const currentUser = await getCurrentUser();
  const query = await searchParams;
  const successMessage = query?.success
    ? tweetSuccessMessages[query.success]
    : null;
  const selectedTopic =
    query?.topic && TWEET_TOPICS.includes(query.topic) ? query.topic : null;

  async function deletePost(formData: FormData) {
    "use server";

    if (!currentUser) {
      redirect("/login");
    }

    const postId = Number(formData.get("postId"));
    const currentTopic = String(formData.get("topic") ?? "");
    const successRedirect = currentTopic
      ? `/tweets?topic=${encodeURIComponent(currentTopic)}&success=deleted`
      : "/tweets?success=deleted";

    if (!postId) return;

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: {
          postId,
        },
      }),
      prisma.post.delete({
        where: {
          id: postId,
          userId: currentUser.id,
        },
      }),
    ]);

    revalidatePath("/tweets");
    redirect(successRedirect);
  }

  async function toggleLike(formData: FormData) {
    "use server";

    if (!currentUser) return;

    const postId = Number(formData.get("postId"));
    const currentTopic = String(formData.get("topic") ?? "");

    if (!postId) return;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: currentUser.id,
          postId,
        },
      });
    }

    revalidatePath("/tweets");
    if (currentTopic) {
      redirect(`/tweets?topic=${encodeURIComponent(currentTopic)}`);
    }
  }

  const posts = await prisma.post.findMany({
    where: selectedTopic
      ? {
          topic: selectedTopic,
        }
      : undefined,
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
      likes: {
        where: {
          userId: currentUser?.id ?? -1,
        },
      },
      user: {
        include: {
          followers: {
            where: {
              followerId: currentUser?.id ?? -1,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            ← Home
          </Link>

          <h1 className="text-3xl font-bold mt-2">Tweets</h1>
        </div>

        {currentUser ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tweets/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              New tweet
            </Link>

            <a
              href="/logout"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </a>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Login
          </Link>
        )}
      </div>

      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {successMessage}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/tweets"
          className={`rounded-lg border px-4 py-2 text-sm transition ${
            !selectedTopic
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
          }`}
        >
          All
        </Link>

        {TWEET_TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/tweets?topic=${encodeURIComponent(topic)}`}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              selectedTopic === topic
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
            }`}
          >
            {topic}
          </Link>
        ))}
      </div>

      {currentUser ? (
        <div className="mb-6 rounded-xl border border-gray-700 bg-zinc-900 p-4">
          <p className="text-sm text-gray-400 mb-2">
            Logged in as {currentUser.username ?? currentUser.email}
          </p>

          <p className="text-gray-300">
            Use the New tweet button to share something.
          </p>
        </div>
      ) : (
        <div className="mb-6 border border-gray-700 bg-zinc-900 p-4 rounded-xl">
          <p className="text-gray-300">
            You can view tweets as a guest, but you need to log in to post, edit,
            delete, or like tweets.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="rounded-xl border border-gray-700 bg-zinc-900 p-6 text-center text-gray-300">
            {selectedTopic
              ? `No ${selectedTopic.toLowerCase()} tweets yet.`
              : "No tweets yet. Be the first to post something."}
          </div>
        )}

        {posts.map((post) => {
          const isOwner = currentUser?.id === post.userId;
          const isLiked = post.likes.length > 0;
          const isFollowingAuthor = post.user.followers.length > 0;
          const redirectTo = selectedTopic
            ? `/tweets?topic=${encodeURIComponent(selectedTopic)}`
            : "/tweets";

          return (
            <div
              key={post.id}
              className="border border-gray-700 bg-zinc-900 p-4 rounded-xl"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
                  {post.topic}
                </p>

                <p className="text-xs font-medium uppercase tracking-wide text-purple-300">
                  {post.mood}
                </p>

                <p className="text-xs text-gray-500">
                  {post._count.likes} likes
                </p>
              </div>

              <h2 className="text-xl font-semibold text-white">{post.title}</h2>

              <p className="mt-2 text-gray-200">{post.content}</p>

              <p className="text-sm text-gray-400 mt-2">
                Posted by{" "}
                <Link
                  href={`/users/${post.userId}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {post.user.username ?? post.user.email}
                </Link>{" "}
                on{" "}
                {new Date(post.createdAt).toLocaleString()}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <Link
                  href={`/tweets/${post.id}`}
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  View
                </Link>

                {currentUser && !isOwner && (
                  <FollowButton
                    userId={post.userId}
                    isFollowing={isFollowingAuthor}
                    redirectTo={redirectTo}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  />
                )}

                {currentUser ? (
                  <form action={toggleLike}>
                    <input type="hidden" name="postId" value={post.id} />
                    {selectedTopic && (
                      <input type="hidden" name="topic" value={selectedTopic} />
                    )}

                    <button className="text-pink-400 hover:text-pink-300 text-sm">
                      {isLiked ? "Unlike" : "Like"} ({post._count.likes})
                    </button>
                  </form>
                ) : (
                  <span className="text-sm text-gray-400">
                    Likes: {post._count.likes}
                  </span>
                )}

                {isOwner && (
                  <>
                    <Link
                      href={`/tweets/${post.id}/edit`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </Link>

                    <form action={deletePost}>
                      <input type="hidden" name="postId" value={post.id} />
                      {selectedTopic && (
                        <input
                          type="hidden"
                          name="topic"
                          value={selectedTopic}
                        />
                      )}

                      <DeleteTweetButton className="text-red-400 hover:text-red-300 text-sm" />
                    </form>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
