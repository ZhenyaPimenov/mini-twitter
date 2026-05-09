import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function TweetsPage() {
  const currentUser = await getCurrentUser();

  async function createPost(formData: FormData) {
    "use server";

    if (!currentUser) return;

    const content = formData.get("content") as string;

    if (!content.trim()) return;

    await prisma.post.create({
      data: {
        content,
        userId: currentUser.id,
      },
    });

    revalidatePath("/tweets");
  }

  async function updatePost(formData: FormData) {
    "use server";

    if (!currentUser) return;

    const postId = Number(formData.get("postId"));
    const content = formData.get("content") as string;

    if (!postId || !content.trim()) return;

    await prisma.post.update({
      where: {
        id: postId,
        userId: currentUser.id,
      },
      data: {
        content,
      },
    });

    revalidatePath("/tweets");
  }

  async function deletePost(formData: FormData) {
    "use server";

    if (!currentUser) return;

    const postId = Number(formData.get("postId"));

    if (!postId) return;

    await prisma.post.delete({
      where: {
        id: postId,
        userId: currentUser.id,
      },
    });

    revalidatePath("/tweets");
  }

  async function toggleLike(formData: FormData) {
    "use server";

    if (!currentUser) return;

    const postId = Number(formData.get("postId"));

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
  }

  const posts = await prisma.post.findMany({
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
      user: true,
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
          <a
            href="/logout"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </a>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Login
          </Link>
        )}
      </div>

      {currentUser ? (
        <form action={createPost} className="mb-6">
          <p className="text-sm text-gray-400 mb-2">
            Logged in as {currentUser.username ?? currentUser.email}
          </p>

          <textarea
            name="content"
            className="w-full border border-gray-700 bg-zinc-900 text-white p-3 rounded"
            placeholder="What's happening?"
          />

          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
            Post
          </button>
        </form>
      ) : (
        <div className="mb-6 border border-gray-700 bg-zinc-900 p-4 rounded-xl">
          <p className="text-gray-300">
            You can view tweets as a guest, but you need to log in to post, edit,
            delete, or like tweets.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const isOwner = currentUser?.id === post.userId;
          const isLiked = post.likes.length > 0;

          return (
            <div
              key={post.id}
              className="border border-gray-700 bg-zinc-900 p-4 rounded-xl"
            >
              {isOwner ? (
                <form action={updatePost} className="space-y-2">
                  <input type="hidden" name="postId" value={post.id} />

                  <textarea
                    name="content"
                    defaultValue={post.content}
                    className="w-full border border-gray-700 bg-zinc-800 text-white p-2 rounded"
                  />

                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Update
                  </button>
                </form>
              ) : (
                <p className="text-lg text-white">{post.content}</p>
              )}

              <p className="text-sm text-gray-400 mt-2">
                Posted by {post.user.username ?? post.user.email} on{" "}
                {new Date(post.createdAt).toLocaleString()}
              </p>

              <div className="flex items-center gap-4 mt-3">
                <Link
                  href={`/tweets/${post.id}`}
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  View
                </Link>

                {currentUser ? (
                  <form action={toggleLike}>
                    <input type="hidden" name="postId" value={post.id} />

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
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />

                    <button className="text-red-400 hover:text-red-300 text-sm">
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
