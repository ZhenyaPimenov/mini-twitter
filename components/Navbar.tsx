import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  return (
    <nav className="flex flex-col gap-4 border-b border-zinc-800 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
      <Link href="/" className="text-3xl font-bold text-white">
        Mini Twitter
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/tweets"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 hover:text-white"
        >
          Tweets
        </Link>

        {currentUser ? (
          <>
            <span className="max-w-56 truncate text-sm text-zinc-400">
              {currentUser.username ?? currentUser.email}
            </span>

            <a
              href="/logout"
              className="bg-white text-black px-4 py-2 rounded-lg font-medium"
            >
              Logout
            </a>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-white text-black px-4 py-2 rounded-lg font-medium"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="border border-white text-white px-4 py-2 rounded-lg font-medium"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
