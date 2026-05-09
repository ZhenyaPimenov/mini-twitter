import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/session";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const loginErrors: Record<string, string> = {
  "missing-fields": "Please enter your email and password.",
  "invalid-credentials": "Email or password is incorrect.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/tweets");
  }

  const errorCode = (await searchParams)?.error;
  const errorMessage = errorCode ? loginErrors[errorCode] : null;

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/login?error=missing-fields");
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      redirect("/login?error=invalid-credentials");
    }

    if (!verifyPassword(password, user.password)) {
      redirect("/login?error=invalid-credentials");
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
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300 transition"
        >
          ← Back home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Log in</h1>

        <p className="text-zinc-400 mb-8">
          Welcome back to Mini Twitter.
        </p>

        {errorMessage && (
          <p className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

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

        <p className="mt-6 text-center text-sm text-zinc-400">
          Do not have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
