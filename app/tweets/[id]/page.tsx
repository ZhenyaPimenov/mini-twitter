import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import DeleteTweetButton from "@/components/DeleteTweetButton";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type TweetDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

const MAX_TWEET_LENGTH = 280;

const tweetErrors: Record<string, string> = {
  "empty-tweet": "Tweet content cannot be empty.",
  "long-tweet": `Tweets must be ${MAX_TWEET_LENGTH} characters or fewer.`,
};

const tweetSuccessMessages: Record<string, string> = {
  updated: "Tweet updated.",
};

export default async function TweetDetailsPage({
  params,
  searchParams,
}: TweetDetailsPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const currentUser = await getCurrentUser();
  const postId = Number(id);
  const errorMessage = query?.error ? tweetErrors[query.error] : null;
  const successMessage = query?.success
    ? tweetSuccessMessages[query.success]
    : null;

  async function deletePost() {
    "use server";

    if (!currentUser) return;

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
    redirect("/tweets?success=deleted");
  }

  async function toggleLike() {
    "use server";

    if (!currentUser) return;

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
    revalidatePath(`/tweets/${postId}`);
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: true,
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
    },
  });

  if (!post) {
    notFound();
  }

  const isOwner = currentUser?.id === post.userId;
  const isLiked = post.likes.length > 0;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link href="/tweets" className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to tweets
      </Link>

      <div className="mt-6 border border-gray-700 bg-zinc-900 p-6 rounded-xl">
        {(errorMessage || successMessage) && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              errorMessage
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-green-500/40 bg-green-500/10 text-green-200"
            }`}
          >
            {errorMessage ?? successMessage}
          </div>
        )}

        <p className="text-sm text-gray-400 mb-2">
          Posted by {post.user.username ?? post.user.email}
        </p>

        <p className="text-xl text-white mb-4">{post.content}</p>

        <p className="text-sm text-gray-400">
          Created at: {new Date(post.createdAt).toLocaleString()}
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Last updated: {new Date(post.updatedAt).toLocaleString()}
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Likes: {post._count.likes}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {currentUser ? (
            <form action={toggleLike}>
              <button className="text-sm text-pink-400 hover:text-pink-300">
                {isLiked ? "Unlike" : "Like"}
              </button>
            </form>
          ) : (
            <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Log in to like
            </Link>
          )}

          {isOwner && (
            <>
              <Link
                href={`/tweets/${post.id}/edit`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Edit
              </Link>

              <form action={deletePost}>
                <DeleteTweetButton className="text-sm text-red-400 hover:text-red-300" />
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
