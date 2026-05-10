import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

type NewTweetPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const MAX_TWEET_LENGTH = 280;

const tweetErrors: Record<string, string> = {
  "empty-tweet": "Tweet content cannot be empty.",
  "long-tweet": `Tweets must be ${MAX_TWEET_LENGTH} characters or fewer.`,
};

export default async function NewTweetPage({
  searchParams,
}: NewTweetPageProps) {
  const currentUser = await getCurrentUser();
  const query = await searchParams;
  const errorMessage = query?.error ? tweetErrors[query.error] : null;

  if (!currentUser) {
    redirect("/login");
  }

  async function createPost(formData: FormData) {
    "use server";

    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const content = String(formData.get("content") ?? "").trim();

    if (!content) {
      redirect("/tweets/new?error=empty-tweet");
    }

    if (content.length > MAX_TWEET_LENGTH) {
      redirect("/tweets/new?error=long-tweet");
    }

    const post = await prisma.post.create({
      data: {
        content,
        userId: user.id,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/tweets");
    redirect(`/tweets/${post.id}?success=created`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <Link
            href="/tweets"
            className="text-blue-400 transition hover:text-blue-300"
          >
            ← Tweets
          </Link>

          <Link
            href="/"
            className="text-blue-400 transition hover:text-blue-300"
          >
            Home
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-3xl font-bold">New tweet</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Signed in as {currentUser.username ?? currentUser.email}
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <form action={createPost} className="mt-6 space-y-4">
            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium">
                Tweet content
              </label>

              <textarea
                id="content"
                name="content"
                maxLength={MAX_TWEET_LENGTH}
                className="min-h-36 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-blue-500"
                placeholder="What's happening?"
              />

              <p className="mt-1 text-xs text-zinc-500">
                Maximum {MAX_TWEET_LENGTH} characters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600">
                Post tweet
              </button>

              <Link
                href="/tweets"
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
