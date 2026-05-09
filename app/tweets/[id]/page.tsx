import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type TweetDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TweetDetailsPage({
  params,
}: TweetDetailsPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      user: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link href="/tweets" className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to tweets
      </Link>

      <div className="mt-6 border border-gray-700 bg-zinc-900 p-6 rounded-xl">
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
      </div>
    </main>
  );
}
