import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-12 py-6 border-b border-zinc-800">
      <Link href="/" className="text-3xl font-bold text-white">
        Mini Twitter
      </Link>

      <div className="flex gap-4">
        <Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg font-medium">
          Login
        </Link>

        <Link href="/register" className="border border-white text-white px-4 py-2 rounded-lg font-medium">
          Register
        </Link>
      </div>
    </nav>
  );
}