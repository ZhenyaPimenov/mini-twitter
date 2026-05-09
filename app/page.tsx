import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <div className="w-full px-12 pt-24">
        <section className="flex flex-col items-center justify-center text-center space-y-6 pt-32">
          <h2 className="text-5xl font-bold leading-tight">
            Share your thoughts with the world.
          </h2>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Mini Twitter is a simple social media platform built with Next.js,
            TypeScript and Prisma.
          </p>

          <button className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold">
            Explore Tweets
          </button>
        </section>
      </div>
    </main>
  );
}