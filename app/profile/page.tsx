import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const [posts, postCount, likeCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        userId: currentUser.id,
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
    prisma.post.count({
      where: {
        userId: currentUser.id,
      },
    }),
    prisma.like.count({
      where: {
        userId: currentUser.id,
      },
    }),
  ]);

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

            <h1 className="mt-3 text-3xl font-bold">My profile</h1>
          </div>

          <a
            href="/logout"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Logout
          </a>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">Signed in as</p>

          <h2 className="mt-1 text-2xl font-semibold">
            {currentUser.username ?? currentUser.email}
          </h2>

          <p className="mt-2 text-sm text-zinc-400">{currentUser.email}</p>

          <p className="mt-1 text-sm text-zinc-500">
            Joined {new Date(currentUser.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{postCount}</p>
              <p className="text-sm text-zinc-400">Tweets posted</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-bold">{likeCount}</p>
              <p className="text-sm text-zinc-400">Tweets liked</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">My tweets</h2>

            <Link
              href="/tweets/new"
              className="text-sm text-blue-400 transition hover:text-blue-300"
            >
              Create tweet
            </Link>
          </div>

          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-300">
                You have not posted any tweets yet.
              </div>
            )}

            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <p className="text-white">{post.content}</p>

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
