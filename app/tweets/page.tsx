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

  async function deletePost(formData: FormData) {
    "use server";

    const postId = Number(formData.get("postId"));

    if (!postId) {
      return;
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/tweets");
  }

  async function updatePost(formData: FormData) {
    "use server";

    const postId = Number(formData.get("postId"));
    const content = formData.get("content") as string;

    if (!postId || !content.trim()) {
      return;
    }

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content,
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
      <h1 className="text-3xl font-bold mb-6">Tweets</h1>

      <form action={createPost} className="mb-6">
        <textarea
          name="content"
          className="w-full border border-gray-700 bg-zinc-900 text-white p-3 rounded"
          placeholder="What's happening?"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-gray-700 bg-zinc-900 p-4 rounded-xl"
          >
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

            <p className="text-sm text-gray-400 mt-2">
              {new Date(post.createdAt).toLocaleString()}
            </p>

            <form action={deletePost} className="mt-3">
              <input type="hidden" name="postId" value={post.id} />

              <button className="text-red-400 hover:text-red-300 text-sm">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}