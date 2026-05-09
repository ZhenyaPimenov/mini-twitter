import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/session";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const registerErrors: Record<string, string> = {
  "missing-fields": "Please fill in username, email, and password.",
  "invalid-email": "Please enter a valid email address.",
  "short-password": "Password must be at least 6 characters long.",
  "user-exists": "A user with this email or username already exists.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/tweets");
  }

  const errorCode = (await searchParams)?.error;
  const errorMessage = errorCode ? registerErrors[errorCode] : null;

  async function register(formData: FormData) {
    "use server";

    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !email || !password) {
      redirect("/register?error=missing-fields");
    }

    if (!email.includes("@")) {
      redirect("/register?error=invalid-email");
    }

    if (password.length < 6) {
      redirect("/register?error=short-password");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      redirect("/register?error=user-exists");
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword(password),
      },
    });

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

        <h1 className="text-3xl font-bold mb-2">Create account</h1>

        <p className="text-zinc-400 mb-8">
          Join Mini Twitter and start sharing your thoughts.
        </p>

        {errorMessage && (
          <p className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

        <form action={register} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>

            <input
              name="username"
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
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
