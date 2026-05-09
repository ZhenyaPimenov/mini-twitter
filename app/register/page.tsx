export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Create account</h1>

        <p className="text-zinc-400 mb-8">
          Join Mini Twitter and start sharing your thoughts.
        </p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-lg py-3 font-semibold"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}