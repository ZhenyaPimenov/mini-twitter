import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    if (!verifyPassword(password, user.password)) {
      return;
    }

    if (!isHashedPassword(user.password)) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashPassword(password),
        },
      });
    }

    const cookieStore = await cookies();

    cookieStore.set("userId", String(user.id));

    redirect("/tweets");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Log in</h1>

        <p className="text-zinc-400 mb-8">
          Welcome back to Mini Twitter.
        </p>

        <form action={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              name="email"
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
              name="password"
              type="password"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-lg py-3 font-semibold"
          >
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}
