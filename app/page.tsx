import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="w-full px-12 py-10">

                <nav className="flex items-center justify-between mb-12">
                    <h1 className="text-3xl font-bold">Mini Twitter</h1>

                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="bg-white text-black px-4 py-2 rounded-lg font-medium"
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className="border border-white px-4 py-2 rounded-lg font-medium"
                        >
                            Register
                        </Link>
                    </div>
                </nav>

                <section className="min-h-[65vh] flex flex-col items-center justify-center text-center space-y-6">
                    <h2 className="text-5xl font-bold leading-tight">
                        Share your thoughts with the world.
                    </h2>

                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Mini Twitter is a simple social media platform built with
                        Next.js, TypeScript and Prisma.
                    </p>

                    <button className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold">
                        Explore Tweets
                    </button>
                </section>
            </div>
        </main>
    );
}