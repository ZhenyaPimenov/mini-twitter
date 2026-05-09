import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function TweetsPage() {
  async function createPost(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;

    if (!content.trim()) {
      return;
    }

    let user = await prisma.user.findFirst();

if (!user) {
  user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: "demo-password",
    },
  });
}

await prisma.post.create({
  data: {
    content,
    userId: user.id,
  },
});

    revalidatePath("/tweets");
  }
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Tweets
      </h1>

      <form action={createPost} className="mb-6">
        <textarea
          name="content"
          className="w-full border p-3 rounded"
          placeholder="What's happening?"
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border p-4 rounded"
          >
            <p>{post.content}</p>

            <p className="text-sm text-gray-500 mt-2">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}