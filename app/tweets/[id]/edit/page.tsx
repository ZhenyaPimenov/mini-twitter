import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type EditTweetPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

const MAX_TWEET_LENGTH = 280;
const MAX_TITLE_LENGTH = 80;
const TWEET_TOPICS = ["General", "Study", "News", "Project", "Personal"];
const TWEET_MOODS = ["Neutral", "Happy", "Serious", "Question", "Excited"];

const tweetErrors: Record<string, string> = {
  "empty-title": "Tweet title cannot be empty.",
  "long-title": `Tweet title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
  "empty-tweet": "Tweet content cannot be empty.",
  "long-tweet": `Tweets must be ${MAX_TWEET_LENGTH} characters or fewer.`,
  "invalid-topic": "Please choose a valid topic.",
  "invalid-mood": "Please choose a valid mood.",
};

export default async function EditTweetPage({
  params,
  searchParams,
}: EditTweetPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const currentUser = await getCurrentUser();
  const postId = Number(id);
  const errorMessage = query?.error ? tweetErrors[query.error] : null;

  if (!currentUser) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    notFound();
  }

  if (post.userId !== currentUser.id) {
    redirect(`/tweets/${post.id}`);
  }

  async function updatePost(formData: FormData) {
    "use server";

    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const topic = String(formData.get("topic") ?? "").trim();
    const mood = String(formData.get("mood") ?? "").trim();

    if (!title) {
      redirect(`/tweets/${postId}/edit?error=empty-title`);
    }

    if (title.length > MAX_TITLE_LENGTH) {
      redirect(`/tweets/${postId}/edit?error=long-title`);
    }

    if (!content) {
      redirect(`/tweets/${postId}/edit?error=empty-tweet`);
    }

    if (content.length > MAX_TWEET_LENGTH) {
      redirect(`/tweets/${postId}/edit?error=long-tweet`);
    }

    if (!TWEET_TOPICS.includes(topic)) {
      redirect(`/tweets/${postId}/edit?error=invalid-topic`);
    }

    if (!TWEET_MOODS.includes(mood)) {
      redirect(`/tweets/${postId}/edit?error=invalid-mood`);
    }

    await prisma.post.update({
      where: {
        id: postId,
        userId: user.id,
      },
      data: {
        title,
        content,
        topic,
        mood,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/tweets");
    revalidatePath(`/tweets/${postId}`);
    redirect(`/tweets/${postId}?success=updated`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <Link
            href={`/tweets/${post.id}`}
            className="text-blue-400 transition hover:text-blue-300"
          >
            ← Tweet details
          </Link>

          <Link
            href="/tweets"
            className="text-blue-400 transition hover:text-blue-300"
          >
            Tweets
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-3xl font-bold">Edit tweet</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Update your tweet content below.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <form action={updatePost} className="mt-6 space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                id="title"
                name="title"
                defaultValue={post.title}
                maxLength={MAX_TITLE_LENGTH}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-zinc-500">
                Maximum {MAX_TITLE_LENGTH} characters.
              </p>
            </div>

            <div>
              <label htmlFor="topic" className="mb-2 block text-sm font-medium">
                Topic
              </label>

              <select
                id="topic"
                name="topic"
                defaultValue={post.topic}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                {TWEET_TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mood" className="mb-2 block text-sm font-medium">
                Mood
              </label>

              <select
                id="mood"
                name="mood"
                defaultValue={post.mood}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                {TWEET_MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-medium">
                Tweet content
              </label>

              <textarea
                id="content"
                name="content"
                defaultValue={post.content}
                maxLength={MAX_TWEET_LENGTH}
                className="min-h-36 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-zinc-500">
                Maximum {MAX_TWEET_LENGTH} characters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600">
                Save changes
              </button>

              <Link
                href={`/tweets/${post.id}`}
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
