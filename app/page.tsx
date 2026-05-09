import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="w-full px-6 pt-20 sm:px-12 sm:pt-24">
        <section className="flex flex-col items-center justify-center text-center space-y-6 pt-32">
          <h2 className="text-5xl font-bold leading-tight">
            Share your thoughts with the world.
          </h2>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Mini Twitter is a simple social media platform built with Next.js,
            TypeScript and Prisma.
          </p>

          {currentUser ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-zinc-500">
                Welcome back, {currentUser.username ?? currentUser.email}.
              </p>

              <Link
                href="/tweets"
                className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold"
              >
                Open Tweets
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/tweets"
                className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold"
              >
                Explore Tweets
              </Link>

              <Link
                href="/register"
                className="border border-zinc-600 hover:border-white transition px-6 py-3 rounded-xl font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
